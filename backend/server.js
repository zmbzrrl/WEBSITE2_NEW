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
      // First, try to get data without the problematic id column to see if the table is accessible
      request.log.info('[ADMIN/USER-GROUPS] Step 1: Testing table access without id column');
      const { data: testData, error: testError } = await supabase
        .schema('public')
        .from('ug')
        .select('ug, prop_id, is_active, created_at')
        .limit(1);
      
      if (testError) {
        request.log.error({ error: testError }, '[ADMIN/USER-GROUPS] Cannot access ug table at all');
        return reply.code(500).send({ 
          error: `Failed to access user groups table: ${testError.message || 'Database error'}` 
        });
      }
      
      request.log.info('[ADMIN/USER-GROUPS] Step 2: Table is accessible, now trying to get id column');
      
      // Now try to get the id column with different names
      // Use a raw query approach by trying to select with each possible column name
      const columnNameAttempts = [
        { name: 'id', quoted: false },
        { name: 'UG_PropID', quoted: true },
        { name: 'ug_propid', quoted: false },
        { name: 'ug_prop_id', quoted: false },
      ];
      
      let data = null;
      let error = null;
      let successfulColumnName = null;
      
      // Try each column name variation
      for (const { name, quoted } of columnNameAttempts) {
        request.log.info(`[ADMIN/USER-GROUPS] Trying column name: ${name} (quoted: ${quoted})`);
        
        // Build the select string - for quoted identifiers, we might need special handling
        const selectString = quoted 
          ? `"${name}", ug, prop_id, is_active, created_at`
          : `${name}, ug, prop_id, is_active, created_at`;
        
        try {
          const result = await supabase
            .schema('public')
            .from('ug')
            .select(selectString);
          
          if (!result.error && result.data) {
            data = result.data;
            successfulColumnName = name;
            request.log.info(`[ADMIN/USER-GROUPS] ✅ Success with column name: ${name}`);
            break;
          } else {
            request.log.warn({ 
              error: result.error?.message, 
              code: result.error?.code,
              column: name 
            }, `[ADMIN/USER-GROUPS] ❌ Failed with column: ${name}`);
            error = result.error;
          }
        } catch (err) {
          request.log.warn({ err, column: name }, `[ADMIN/USER-GROUPS] Exception with column: ${name}`);
          error = err;
        }
      }
      
      // If all specific column names failed, try select(*) as last resort
      if (!data && error) {
        request.log.warn('[ADMIN/USER-GROUPS] Step 3: All column names failed, trying select(*)');
        try {
          const starResult = await supabase
            .schema('public')
            .from('ug')
            .select('*');
          
          if (!starResult.error && starResult.data) {
            data = starResult.data;
            error = null;
            request.log.info('[ADMIN/USER-GROUPS] ✅ select(*) succeeded');
          } else {
            error = starResult.error;
            request.log.error({ error: starResult.error }, '[ADMIN/USER-GROUPS] ❌ select(*) also failed');
          }
        } catch (err) {
          request.log.error({ err }, '[ADMIN/USER-GROUPS] Exception with select(*)');
          error = err;
        }
      }

      if (error || !data) {
        request.log.error({ 
          error, 
          errorMessage: error?.message, 
          errorCode: error?.code,
          successfulColumn: successfulColumnName,
          hint: 'The ug table primary key column name does not match any expected pattern. Please check your database schema.'
        }, '[ADMIN/USER-GROUPS] ❌ All attempts failed');
        return reply.code(500).send({ 
          error: `Failed to fetch user groups: ${error?.message || 'Database error'}. The primary key column might be named differently. Please check your database table structure.` 
        });
      }

      request.log.info({ 
        rowCount: data.length, 
        successfulColumn: successfulColumnName,
        sampleKeys: data.length > 0 ? Object.keys(data[0]) : []
      }, '[ADMIN/USER-GROUPS] ✅ Data retrieved successfully');

      // Map the data to use consistent column names
      if (data) {
        data = data.map((item, index) => {
          // Find the id value from any possible column name
          const idValue = item.id || item.UG_PropID || item.ug_propid || item.ug_prop_id || item['UG_PropID'] || `temp_${index}`;
          
          return {
            id: idValue,
            ug: item.ug,
            prop_id: item.prop_id,
            is_active: item.is_active !== undefined ? item.is_active : true,
            created_at: item.created_at
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

    // Find the matching record by checking all possible id column names
    const found = allData?.find(item => 
      item.id === id || 
      item.UG_PropID === id || 
      item.ug_propid === id ||
      item['UG_PropID'] === id
    );

    if (!found) {
      return reply.code(404).send({ error: 'User group not found' });
    }

    // Map to consistent format
    const data = {
      id: found.id || found.UG_PropID || found.ug_propid || found['UG_PropID'],
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

    // Try inserting with 'id' first
    let insertData = {
      id,
      ug,
      prop_id: propId,
      is_active: isActive,
    };

    let { data, error } = await supabase
      .schema('public')
      .from('ug')
      .insert([insertData])
      .select('*')
      .single();

    // If 'id' column doesn't exist, try with 'UG_PropID'
    if (error && error.message && (error.message.includes('column') && error.message.includes('does not exist'))) {
      request.log.warn({ error: error.message }, '[ADMIN/USER-GROUPS] id column not found, trying UG_PropID');
      insertData = {
        UG_PropID: id,
        ug,
        prop_id: propId,
        is_active: isActive,
      };
      const result = await supabase
        .schema('public')
        .from('ug')
        .insert([insertData])
        .select('*')
        .single();
      data = result.data;
      error = result.error;
      // Map UG_PropID back to id for consistency
      if (data) {
        data = {
          id: data.UG_PropID || data.id,
          ug: data.ug,
          prop_id: data.prop_id,
          is_active: data.is_active
        };
      }
    }

    if (error) {
      request.log.error({ error }, 'Failed to create user group');
      return reply.code(500).send({ error: error.message || 'Failed to create user group' });
    }

    return reply.code(201).send(data);
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

    // Try with 'id' first
    let { data, error } = await supabase
      .schema('public')
      .from('ug')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    // If 'id' column doesn't exist, try with 'UG_PropID'
    if (error && error.message && (error.message.includes('column') && error.message.includes('does not exist'))) {
      request.log.warn({ error: error.message }, '[ADMIN/USER-GROUPS] id column not found, trying UG_PropID');
      const result = await supabase
        .schema('public')
        .from('ug')
        .update(updateData)
        .eq('UG_PropID', id)
        .select('*')
        .single();
      data = result.data;
      error = result.error;
      // Map UG_PropID back to id for consistency
      if (data) {
        data = {
          id: data.UG_PropID || data.id,
          ug: data.ug,
          prop_id: data.prop_id,
          is_active: data.is_active
        };
      }
    } else if (data) {
      // Map to consistent format
      data = {
        id: data.id || data.UG_PropID || data.ug_propid,
        ug: data.ug,
        prop_id: data.prop_id,
        is_active: data.is_active
      };
    }

    if (error || !data) {
      request.log.error({ error }, 'Failed to update user group');
      return reply.code(500).send({ error: error?.message || 'Failed to update user group' });
    }

    return reply.send(data);
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

    // Try with 'id' first
    let { error } = await supabase
      .schema('public')
      .from('ug')
      .delete()
      .eq('id', id);

    // If 'id' column doesn't exist, try with 'UG_PropID'
    if (error && error.message && (error.message.includes('column') && error.message.includes('does not exist'))) {
      request.log.warn({ error: error.message }, '[ADMIN/USER-GROUPS] id column not found, trying UG_PropID');
      const result = await supabase
        .schema('public')
        .from('ug')
        .delete()
        .eq('UG_PropID', id);
      error = result.error;
    }

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


