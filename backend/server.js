import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET,
  FRONTEND_ORIGIN = 'http://localhost:3000',
  PORT = 4000,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    '[backend] Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or JWT_SECRET. Backend auth will not work until these are set.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: FRONTEND_ORIGIN,
  credentials: true,
});

await fastify.register(cookie, {
  hook: 'onRequest',
});

const ACCESS_COOKIE_NAME = 'accessToken';
const ACCESS_TOKEN_TTL_SECONDS = 60 * 30; // 30 minutes

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

async function authRequired(request, reply) {
  const token = request.cookies?.[ACCESS_COOKIE_NAME];
  const allCookies = Object.keys(request.cookies || {});
  
  request.log.info({ 
    hasToken: !!token,
    tokenLength: token?.length,
    allCookies: allCookies,
    cookieName: ACCESS_COOKIE_NAME
  }, '[AUTH_REQUIRED] Checking for auth cookie');

  if (!token) {
    request.log.warn({ allCookies }, '[AUTH_REQUIRED] No token found in cookies');
    return reply.code(401).send({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
    request.log.info({ email: decoded.email }, '[AUTH_REQUIRED] Token verified successfully');
  } catch (err) {
    request.log.warn({ err: err.message }, '[AUTH_REQUIRED] Invalid or expired token');
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
}

function adminRequired(request, reply, done) {
  if (!request.user?.isAdmin) {
    reply.code(403).send({ error: 'Admin access required' });
    return;
  }
  done();
}

function setAuthCookie(reply, token) {
  reply.setCookie(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only secure in production (HTTPS)
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
}

function clearAuthCookie(reply) {
  reply.clearCookie(ACCESS_COOKIE_NAME, {
    path: '/',
  });
}

// ===== AUTH ROUTES =====

// Login: email + password
fastify.post('/auth/login', async (request, reply) => {
  const { email, password } = request.body || {};

  request.log.info({ email: email ? 'provided' : 'missing' }, '[LOGIN] Login attempt started');

  if (!email || !password) {
    request.log.warn({ email: !!email, password: !!password }, '[LOGIN] Missing email or password');
    return reply.code(400).send({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  request.log.info({ normalizedEmail }, '[LOGIN] Looking up user in database');

  const { data: user, error } = await supabase
    .schema('public')
    .from('users')
    .select('email, ug_id, is_active, is_admin, password_hash')
    .eq('email', normalizedEmail)
    .single();

  if (error || !user) {
    request.log.warn({ error, normalizedEmail }, '[LOGIN] User not found in database');
    return reply.code(401).send({ error: 'Invalid email or password' });
  }

  request.log.info({ email: user.email, isActive: user.is_active }, '[LOGIN] User found, checking status');

  if (user.is_active === false) {
    request.log.warn({ email: user.email }, '[LOGIN] User is inactive');
    return reply.code(403).send({ error: 'User is inactive' });
  }

  if (!user.password_hash) {
    request.log.error(
      { email: user.email },
      '[LOGIN] User has no password_hash set. Please migrate users to use hashed passwords.'
    );
    return reply.code(500).send({ error: 'User is not configured for password login' });
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    request.log.warn({ email: user.email }, '[LOGIN] Password mismatch');
    return reply.code(401).send({ error: 'Invalid email or password' });
  }

  request.log.info({ email: user.email }, '[LOGIN] Password verified, generating token');

  const token = signAccessToken({
    email: user.email,
    ugId: user.ug_id,
    isAdmin: Boolean(user.is_admin),
  });

  setAuthCookie(reply, token);
  request.log.info({ email: user.email, cookieSet: true }, '[LOGIN] Auth cookie set, sending response');

  return reply.send({
    email: user.email,
    ugId: user.ug_id,
    isAdmin: Boolean(user.is_admin),
  });
});

// Who am I? (used by frontend guard)
fastify.get('/auth/me', { preHandler: authRequired }, async (request, reply) => {
  const { email } = request.user;
  const cookieToken = request.cookies?.[ACCESS_COOKIE_NAME];

  request.log.info({ 
    email, 
    hasCookie: !!cookieToken,
    cookieLength: cookieToken?.length 
  }, '[AUTH/ME] Checking authentication');

  const { data: user, error } = await supabase
    .schema('public')
    .from('users')
    .select('email, ug_id, is_active, is_admin')
    .eq('email', email)
    .single();

  if (error || !user || user.is_active === false) {
    request.log.warn({ email, error, userFound: !!user, isActive: user?.is_active }, '[AUTH/ME] User check failed, clearing cookie');
    clearAuthCookie(reply);
    return reply.code(401).send({ error: 'Not authenticated' });
  }

  request.log.info({ email: user.email }, '[AUTH/ME] Authentication successful');
  return reply.send({
    email: user.email,
    ugId: user.ug_id,
    isAdmin: Boolean(user.is_admin),
  });
});

// Logout: clear cookie
fastify.post('/auth/logout', async (request, reply) => {
  clearAuthCookie(reply);
  return reply.send({ success: true });
});

// ===== ADMIN ROUTES =====

// ===== USER MANAGEMENT ROUTES =====

// Get all users
fastify.get(
  '/admin/users',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    try {
      // First try with created_at, if that fails, try without it
      let { data, error } = await supabase
        .schema('public')
        .from('users')
        .select('email, ug_id, is_active, is_admin, created_at');

      // If created_at column doesn't exist, try without it
      if (error && error.message && error.message.includes('created_at')) {
        request.log.warn({ error: error.message }, '[ADMIN/USERS] created_at column not found, fetching without it');
        const result = await supabase
          .schema('public')
          .from('users')
          .select('email, ug_id, is_active, is_admin');
        data = result.data;
        error = result.error;
      }

      if (error) {
        request.log.error({ error, errorMessage: error.message, errorDetails: error }, '[ADMIN/USERS] Failed to fetch users from database');
        return reply.code(500).send({ error: `Failed to fetch users: ${error.message || 'Database error'}` });
      }

      // Sort by email if created_at doesn't exist
      if (data && data.length > 0 && !data[0].created_at) {
        data.sort((a, b) => a.email.localeCompare(b.email));
      } else if (data && data.length > 0) {
        data.sort((a, b) => {
          const aTime = new Date(a.created_at || 0).getTime();
          const bTime = new Date(b.created_at || 0).getTime();
          return bTime - aTime; // descending
        });
      }

      request.log.info({ count: data?.length || 0 }, '[ADMIN/USERS] Successfully fetched users');
      return reply.send(data || []);
    } catch (err) {
      request.log.error({ err }, '[ADMIN/USERS] Unexpected error fetching users');
      return reply.code(500).send({ error: 'Unexpected error fetching users' });
    }
  }
);

// Get single user
fastify.get(
  '/admin/users/:email',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { email } = request.params;
    const normalizedEmail = String(email).trim().toLowerCase();

    const { data, error } = await supabase
      .schema('public')
      .from('users')
      .select('email, ug_id, is_active, is_admin, created_at')
      .eq('email', normalizedEmail)
      .single();

    if (error || !data) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return reply.send(data);
  }
);

// Create a user
fastify.post(
  '/admin/users',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { email, password, ugId, isActive = true, isAdmin = false } = request.body || {};

    if (!email || !password || !ugId) {
      return reply
        .code(400)
        .send({ error: 'email, password and ugId are required to create a user' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .schema('public')
      .from('users')
      .insert([
        {
          email: normalizedEmail,
          password_hash,
          ug_id: ugId,
          is_active: isActive,
          is_admin: isAdmin,
        },
      ])
      .select('email, ug_id, is_active, is_admin')
      .single();

    if (error) {
      request.log.error({ error }, 'Failed to create user');
      return reply.code(500).send({ error: error.message || 'Failed to create user' });
    }

    return reply.code(201).send({
      email: data.email,
      ugId: data.ug_id,
      isActive: data.is_active,
      isAdmin: data.is_admin,
    });
  }
);

// Update a user
fastify.put(
  '/admin/users/:email',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { email } = request.params;
    const normalizedEmail = String(email).trim().toLowerCase();
    const { password, ugId, isActive, isAdmin } = request.body || {};

    const updateData = {};
    if (ugId !== undefined) updateData.ug_id = ugId;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (isAdmin !== undefined) updateData.is_admin = isAdmin;
    if (password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    if (Object.keys(updateData).length === 0) {
      return reply.code(400).send({ error: 'No fields to update' });
    }

    updateData.last_modified = new Date().toISOString();

    const { data, error } = await supabase
      .schema('public')
      .from('users')
      .update(updateData)
      .eq('email', normalizedEmail)
      .select('email, ug_id, is_active, is_admin')
      .single();

    if (error || !data) {
      request.log.error({ error }, 'Failed to update user');
      return reply.code(500).send({ error: error?.message || 'Failed to update user' });
    }

    return reply.send(data);
  }
);

// Delete a user
fastify.delete(
  '/admin/users/:email',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { email } = request.params;
    const normalizedEmail = String(email).trim().toLowerCase();

    // Prevent deleting yourself
    if (normalizedEmail === request.user.email) {
      return reply.code(400).send({ error: 'Cannot delete your own account' });
    }

    const { error } = await supabase
      .schema('public')
      .from('users')
      .delete()
      .eq('email', normalizedEmail);

    if (error) {
      request.log.error({ error }, 'Failed to delete user');
      return reply.code(500).send({ error: 'Failed to delete user' });
    }

    return reply.send({ success: true, message: 'User deleted successfully' });
  }
);

// ===== USER GROUP (UG) MANAGEMENT ROUTES =====

// Get all user groups
fastify.get(
  '/admin/user-groups',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    try {
      request.log.info('[ADMIN/USER-GROUPS] Fetching user groups data');
      
      // The error "column ug.prop_id does not exist" suggests Supabase/PostgREST
      // is trying to expand relationships or the column doesn't exist.
      // Let's try a direct REST API call to avoid any relationship expansion
      
      let data = null;
      let error = null;
      
      // The error suggests the prop_id column doesn't exist in the database
      // Try querying with minimal columns that should definitely exist
      // Start with the most basic query possible
      try {
        // First, try to get just the ug column to verify table access
        const testQuery = await supabase
          .schema('public')
          .from('ug')
          .select('ug')
          .limit(1);
        
        if (testQuery.error) {
          request.log.error({ error: testQuery.error }, '[ADMIN/USER-GROUPS] Cannot access ug table at all');
          error = testQuery.error;
        } else {
          // Table is accessible, now try to get all available columns
          // Use ug_id as the primary key (as per database schema)
          const basicQuery = await supabase
            .schema('public')
            .from('ug')
            .select('ug_id, ug, is_active, created_at, prop_id');
          
          if (basicQuery.error) {
            error = basicQuery.error;
            request.log.error({ error: basicQuery.error }, '[ADMIN/USER-GROUPS] Failed to query with id');
          } else {
            data = basicQuery.data;
            request.log.info({ 
              rowCount: data?.length || 0,
              sampleKeys: data && data.length > 0 ? Object.keys(data[0]) : []
            }, '[ADMIN/USER-GROUPS] ✅ Success with id query');
          }
        }
      } catch (fetchErr) {
        request.log.warn({ fetchErr }, '[ADMIN/USER-GROUPS] Direct REST API failed, trying Supabase client');
        
        // Fallback: try multiple column combinations
        const attempts = [
          // Attempt 1: Use ug_id as primary key
          () => supabase.schema('public').from('ug').select('ug_id, ug, is_active, created_at, prop_id'),
          // Attempt 2: Without schema specification
          () => supabase.from('ug').select('ug_id, ug, is_active, created_at, prop_id'),
          // Attempt 3: Just the ug column
          () => supabase.schema('public').from('ug').select('ug'),
        ];
        
        for (let i = 0; i < attempts.length; i++) {
          try {
            request.log.info(`[ADMIN/USER-GROUPS] Fallback attempt ${i + 1}/${attempts.length}`);
            const result = await attempts[i]();
            
            if (!result.error && result.data) {
              data = result.data;
              error = null;
              request.log.info(`[ADMIN/USER-GROUPS] ✅ Success with fallback attempt ${i + 1}`);
              break;
            } else if (result.error) {
              error = result.error;
              // Continue to next attempt unless it's a non-prop_id error on last attempt
              if (i < attempts.length - 1 || result.error.message?.includes('prop_id')) {
                continue;
              }
            }
          } catch (err) {
            request.log.warn({ err, attempt: i + 1 }, `[ADMIN/USER-GROUPS] Exception in fallback attempt ${i + 1}`);
            error = err;
            continue;
          }
        }
      }

      if (error && !data) {
        // Only return error if we have no data at all
        const isPropIdError = error?.message?.includes('prop_id');
        request.log.error({ 
          error, 
          errorMessage: error?.message, 
          errorCode: error?.code,
          isPropIdError
        }, '[ADMIN/USER-GROUPS] ❌ All attempts failed to fetch user groups');
        
        // Provide helpful error message if it's a prop_id issue
        if (isPropIdError) {
          return reply.code(500).send({ 
            error: `Database schema issue: The 'prop_id' column is missing from the 'ug' table. Please run the SQL script 'add-prop_id-to-ug-table.sql' in your Supabase SQL Editor to fix this. Original error: ${error?.message || 'Database error'}` 
          });
        }
        
        return reply.code(500).send({ 
          error: `Failed to access user groups table: ${error?.message || 'Database error'}` 
        });
      }

      if (!data) {
        request.log.warn('[ADMIN/USER-GROUPS] No data returned from query');
        return reply.send([]);
      }

      request.log.info({ 
        rowCount: data.length, 
        sampleKeys: data.length > 0 ? Object.keys(data[0]) : []
      }, '[ADMIN/USER-GROUPS] ✅ Data retrieved successfully');

      // Map the data to use consistent column names
      if (data) {
        data = data.map((item, index) => {
          // Use ug_id as the primary identifier (from database)
          const ugIdValue = item.ug_id || item.id || `temp_${index}`;

          // Handle prop_id - check various possible column names
          const propIdValue = item.prop_id || item.propId || item.propID || item['prop_id'] || null;

          return {
            id: ugIdValue, // Map ug_id to id for frontend compatibility
            ug: item.ug || '',
            prop_id: propIdValue,
            is_active: item.is_active !== undefined ? item.is_active : (item.isActive !== undefined ? item.isActive : true),
            created_at: item.created_at || item.createdAt || null
          };
        });
      }

      // Sort by created_at if available, otherwise by id
      if (data && data.length > 0) {
        if (data[0].created_at) {
          data.sort((a, b) => {
            const aTime = new Date(a.created_at || 0).getTime();
            const bTime = new Date(b.created_at || 0).getTime();
            return bTime - aTime; // descending
          });
        } else {
          data.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        }
      }

      request.log.info({ count: data?.length || 0 }, '[ADMIN/USER-GROUPS] Successfully fetched user groups');
      return reply.send(data || []);
    } catch (err) {
      request.log.error({ err }, '[ADMIN/USER-GROUPS] Unexpected error fetching user groups');
      return reply.code(500).send({ error: 'Unexpected error fetching user groups' });
    }
  }
);

// Get single user group
fastify.get(
  '/admin/user-groups/:id',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { id } = request.params;

    // Select all columns to avoid column name issues
    const { data: allData, error: fetchError } = await supabase
      .schema('public')
      .from('ug')
      .select('*');

    if (fetchError) {
      request.log.error({ error: fetchError }, '[ADMIN/USER-GROUPS] Failed to fetch user groups');
      return reply.code(500).send({ error: 'Failed to fetch user group' });
    }

    // Find the matching record by ug_id (which maps to id in frontend)
    const found = allData?.find(item =>
      item.ug_id === id || item.id === id
    );

    if (!found) {
      return reply.code(404).send({ error: 'User group not found' });
    }

    // Map to consistent format
    const data = {
      id: found.ug_id || found.id,
      ug: found.ug,
      prop_id: found.prop_id,
      is_active: found.is_active !== undefined ? found.is_active : true,
      created_at: found.created_at
    };

    return reply.send(data);
  }
);

// Create a user group
fastify.post(
  '/admin/user-groups',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { id, ug, propId, isActive = true } = request.body || {};

    if (!id || !ug || !propId) {
      return reply
        .code(400)
        .send({ error: 'id, ug, and propId are required to create a user group' });
    }

    // Use ug_id as the primary key (as per database schema)
    const insertData = {
      ug_id: id, // Map id to ug_id for database
      ug,
      prop_id: propId,
      is_active: isActive,
    };

    const { data, error } = await supabase
      .schema('public')
      .from('ug')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      request.log.error({ error }, 'Failed to create user group');
      return reply.code(500).send({ error: error.message || 'Failed to create user group' });
    }

    // Map to consistent format
    const responseData = {
      id: data.ug_id || data.id,
      ug: data.ug,
      prop_id: data.prop_id,
      is_active: data.is_active
    };

    return reply.code(201).send(responseData);
  }
);

// Update a user group
fastify.put(
  '/admin/user-groups/:id',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { id } = request.params;
    const { ug, propId, isActive } = request.body || {};

    const updateData = {};
    if (ug !== undefined) updateData.ug = ug;
    if (propId !== undefined) updateData.prop_id = propId;
    if (isActive !== undefined) updateData.is_active = isActive;

    if (Object.keys(updateData).length === 0) {
      return reply.code(400).send({ error: 'No fields to update' });
    }

    updateData.last_modified = new Date().toISOString();

    // Use ug_id as the primary key (as per database schema)
    const { data, error } = await supabase
      .schema('public')
      .from('ug')
      .update(updateData)
      .eq('ug_id', id)
      .select('*')
      .single();

    // Map to consistent format
    let responseData = null;
    if (data) {
      responseData = {
        id: data.ug_id || data.id,
        ug: data.ug,
        prop_id: data.prop_id,
        is_active: data.is_active
      };
    }

    if (error || !responseData) {
      request.log.error({ error }, 'Failed to update user group');
      return reply.code(500).send({ error: error?.message || 'Failed to update user group' });
    }

    return reply.send(responseData);
  }
);

// Delete a user group
fastify.delete(
  '/admin/user-groups/:id',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { id } = request.params;

    // Use ug_id as the primary key (as per database schema)
    const { error } = await supabase
      .schema('public')
      .from('ug')
      .delete()
      .eq('ug_id', id);

    if (error) {
      request.log.error({ error }, 'Failed to delete user group');
      return reply.code(500).send({ error: 'Failed to delete user group' });
    }

    return reply.send({ success: true, message: 'User group deleted successfully' });
  }
);

// ===== PROPERTY MANAGEMENT ROUTES =====

// Get all properties
fastify.get(
  '/admin/properties',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    try {
      // First try with created_at, if that fails, try without it
      let { data, error } = await supabase
        .schema('public')
        .from('property')
        .select('prop_id, region, property_name, is_active, created_at');

      // If created_at column doesn't exist, try without it
      if (error && error.message && error.message.includes('created_at')) {
        request.log.warn({ error: error.message }, '[ADMIN/PROPERTIES] created_at column not found, fetching without it');
        const result = await supabase
          .schema('public')
          .from('property')
          .select('prop_id, region, property_name, is_active');
        data = result.data;
        error = result.error;
      }

      if (error) {
        request.log.error({ error, errorMessage: error.message, errorDetails: error }, '[ADMIN/PROPERTIES] Failed to fetch properties from database');
        return reply.code(500).send({ error: `Failed to fetch properties: ${error.message || 'Database error'}` });
      }

      // Sort by prop_id if created_at doesn't exist
      if (data && data.length > 0 && !data[0].created_at) {
        data.sort((a, b) => a.prop_id.localeCompare(b.prop_id));
      } else if (data && data.length > 0) {
        data.sort((a, b) => {
          const aTime = new Date(a.created_at || 0).getTime();
          const bTime = new Date(b.created_at || 0).getTime();
          return bTime - aTime; // descending
        });
      }

      request.log.info({ count: data?.length || 0 }, '[ADMIN/PROPERTIES] Successfully fetched properties');
      return reply.send(data || []);
    } catch (err) {
      request.log.error({ err }, '[ADMIN/PROPERTIES] Unexpected error fetching properties');
      return reply.code(500).send({ error: 'Unexpected error fetching properties' });
    }
  }
);

// Get single property
fastify.get(
  '/admin/properties/:propId',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { propId } = request.params;

    // Try with created_at first
    let { data, error } = await supabase
      .schema('public')
      .from('property')
      .select('prop_id, region, property_name, is_active, created_at')
      .eq('prop_id', propId)
      .single();

    // If created_at doesn't exist, try without it
    if (error && error.message && error.message.includes('created_at')) {
      const result = await supabase
        .schema('public')
        .from('property')
        .select('prop_id, region, property_name, is_active')
        .eq('prop_id', propId)
        .single();
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return reply.code(404).send({ error: 'Property not found' });
    }

    return reply.send(data);
  }
);

// Create a property
fastify.post(
  '/admin/properties',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { propId, region, propertyName, isActive = true } = request.body || {};

    if (!propId || !region || !propertyName) {
      return reply
        .code(400)
        .send({ error: 'propId, region, and propertyName are required to create a property' });
    }

    const { data, error } = await supabase
      .schema('public')
      .from('property')
      .insert([
        {
          prop_id: propId,
          region,
          property_name: propertyName,
          is_active: isActive,
        },
      ])
      .select('prop_id, region, property_name, is_active')
      .single();

    if (error) {
      request.log.error({ error }, 'Failed to create property');
      return reply.code(500).send({ error: error.message || 'Failed to create property' });
    }

    return reply.code(201).send(data);
  }
);

// Update a property
fastify.put(
  '/admin/properties/:propId',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { propId } = request.params;
    const { region, propertyName, isActive } = request.body || {};

    const updateData = {};
    if (region !== undefined) updateData.region = region;
    if (propertyName !== undefined) updateData.property_name = propertyName;
    if (isActive !== undefined) updateData.is_active = isActive;

    if (Object.keys(updateData).length === 0) {
      return reply.code(400).send({ error: 'No fields to update' });
    }

    updateData.last_modified = new Date().toISOString();

    const { data, error } = await supabase
      .schema('public')
      .from('property')
      .update(updateData)
      .eq('prop_id', propId)
      .select('prop_id, region, property_name, is_active')
      .single();

    if (error || !data) {
      request.log.error({ error }, 'Failed to update property');
      return reply.code(500).send({ error: error?.message || 'Failed to update property' });
    }

    return reply.send(data);
  }
);

// Delete a property
fastify.delete(
  '/admin/properties/:propId',
  {
    preHandler: [authRequired, adminRequired],
  },
  async (request, reply) => {
    const { propId } = request.params;

    const { error } = await supabase
      .schema('public')
      .from('property')
      .delete()
      .eq('prop_id', propId);

    if (error) {
      request.log.error({ error }, 'Failed to delete property');
      return reply.code(500).send({ error: 'Failed to delete property' });
    }

    return reply.send({ success: true, message: 'Property deleted successfully' });
  }
);

// Simple health check
fastify.get('/health', async () => ({ ok: true }));

try {
  await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
  // eslint-disable-next-line no-console
  console.log(`[backend] Auth server listening on port ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}


