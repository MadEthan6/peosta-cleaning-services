/**
 * Mock Supabase interceptor for Playwright E2E tests.
 * This helper runs inside the Playwright runner and intercepts all network requests
 * pointing to the Supabase endpoint, serving them with mock responses.
 * It maintains an in-memory database to allow create, read, update, and delete actions.
 */

export async function setupSupabaseMocks(page) {
  // Default in-memory database state
  const mockDb = {
    profiles: [
      { id: 'owner-uuid-1234', email: 'ethanburds@gmail.com', full_name: 'Ethan Burds', role: 'owner', availability: {} },
      { id: 'employee-uuid-5678', email: 'employee@peostacleaning.com', full_name: 'Jane Doe', role: 'employee', availability: ['Monday', 'Wednesday', 'Friday'] },
      { id: 'client-uuid-9999', email: 'client@example.com', full_name: 'Alice Smith', role: 'client', availability: {} }
    ],
    jobs: [
      {
        id: 'job-uuid-1',
        client_name: 'Alice Smith',
        client_email: 'client@example.com',
        client_phone: '563-555-0199',
        address: '456 Elm St, Peosta IA',
        service_package: 'Standard Home Cleaning',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        price: 180,
        status: 'pending',
        payment_status: 'unpaid',
        employee_id: null,
        rating: null,
        tip_amount: null,
        completed_photos: []
      }
    ],
    checklist_items: [
      { id: 'task-uuid-1', job_id: 'job-uuid-1', task_description: 'Vacuum all carpets and rugs', is_completed: false },
      { id: 'task-uuid-2', job_id: 'job-uuid-1', task_description: 'Mop all hard floors', is_completed: true }
    ],
    rates: [
      { id: 'rate-uuid-1', package_type: 'standard', price_per_sq_ft: 0.12, updated_at: new Date().toISOString() },
      { id: 'rate-uuid-2', package_type: 'deep', price_per_sq_ft: 0.20, updated_at: new Date().toISOString() },
      { id: 'rate-uuid-3', package_type: 'commercial', price_per_sq_ft: 0.15, updated_at: new Date().toISOString() }
    ],
    promo_codes: [
      { code: 'WELCOME10', discount_percent: 10, active: true },
      { code: 'CLEAN20', discount_percent: 20, active: true }
    ]
  };

  // Helper for CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, prefer, x-client-info',
    'Access-Control-Max-Age': '86400'
  };

  // 1. Intercept Preflight OPTIONS requests for both Auth and Rest
  await page.route(url => url.href.includes('/auth/v1/') || url.href.includes('/rest/v1/'), async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders
      });
    } else {
      await route.fallback();
    }
  });

  // 2. Intercept Auth Requests
  await page.route('**/auth/v1/**', async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return;

    const url = new URL(req.url());
    const method = req.method();
    const bodyText = req.postData();
    const body = bodyText ? JSON.parse(bodyText) : {};

    console.log(`[Mock Auth] ${method} ${url.pathname}`, body);

    if (url.pathname.endsWith('/signup')) {
      // Client Registration / Staff Employee Account creation
      const email = body.email || '';
      const password = body.password || '';
      const metadata = body.options?.data || {};
      const fullName = metadata.full_name || 'New User';
      const role = metadata.role || 'client';

      // Integrity Restriction: Public signup is disabled for employees and the owner unless created by Owner
      if (role === 'owner' && email.toLowerCase() !== 'ethanburds@gmail.com') {
        return route.fulfill({
          status: 400,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Public registration for Owner role is restricted.' })
        });
      }

      const newUserId = `user-uuid-${Math.random().toString(36).substr(2, 9)}`;
      const newUser = { id: newUserId, email, full_name: fullName, role };
      mockDb.profiles.push(newUser);

      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: newUserId,
            email: email,
            user_metadata: metadata
          },
          session: {
            access_token: `mock-token-${newUserId}`,
            token_type: 'bearer',
            expires_in: 3600,
            user: { id: newUserId, email }
          }
        })
      });
    }

    if (url.pathname.endsWith('/token')) {
      const grantType = url.searchParams.get('grant_type');
      if (grantType === 'password') {
        const email = body.email || '';
        // Find existing user profile
        const userProfile = mockDb.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (!userProfile) {
          // Allow authentication for new mock clients automatically or restrict based on email rules
          if (email.toLowerCase().includes('staff') || email.toLowerCase().includes('employee')) {
            return route.fulfill({
              status: 400,
              headers: corsHeaders,
              contentType: 'application/json',
              body: JSON.stringify({ message: 'Invalid credentials or restricted staff registration.' })
            });
          }
          // Default fallback client login
          const newUserId = `user-uuid-${Math.random().toString(36).substr(2, 9)}`;
          const newProfile = { id: newUserId, email, full_name: 'Client User', role: 'client' };
          mockDb.profiles.push(newProfile);
          return route.fulfill({
            status: 200,
            headers: corsHeaders,
            contentType: 'application/json',
            body: JSON.stringify({
              user: { id: newUserId, email, user_metadata: { role: 'client', full_name: 'Client User' } },
              session: { access_token: `mock-token-${newUserId}`, expires_in: 3600, user: { id: newUserId, email } }
            })
          });
        }

        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: userProfile.id,
              email: userProfile.email,
              user_metadata: {
                role: userProfile.role,
                full_name: userProfile.full_name
              }
            },
            session: {
              access_token: `mock-token-${userProfile.id}`,
              token_type: 'bearer',
              expires_in: 3600,
              user: {
                id: userProfile.id,
                email: userProfile.email
              }
            }
          })
        });
      }
    }

    if (url.pathname.endsWith('/logout') || url.pathname.endsWith('/signout')) {
      return route.fulfill({
        status: 204,
        headers: corsHeaders
      });
    }

    // Default return for auth requests
    return route.fulfill({
      status: 200,
      headers: corsHeaders,
      contentType: 'application/json',
      body: JSON.stringify({ user: null, session: null })
    });
  });

  // 3. Intercept Database REST Requests
  await page.route('**/rest/v1/**', async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return;

    const url = new URL(req.url());
    const method = req.method();
    const searchParams = url.searchParams;
    const bodyText = req.postData();
    const body = bodyText ? JSON.parse(bodyText) : null;

    // Determine target table from pathname, e.g. /rest/v1/profiles -> profiles
    const pathParts = url.pathname.split('/');
    const table = pathParts[pathParts.length - 1];

    console.log(`[Mock DB] ${method} table:${table}`, searchParams.toString(), body);

    if (method === 'GET') {
      if (table === 'profiles') {
        const idParam = searchParams.get('id');
        const roleParam = searchParams.get('role');

        if (idParam) {
          const idVal = idParam.replace('eq.', '');
          const profile = mockDb.profiles.find(p => p.id === idVal);
          return route.fulfill({
            status: 200,
            headers: corsHeaders,
            contentType: 'application/json',
            body: JSON.stringify(profile ? [profile] : [])
          });
        }
        if (roleParam) {
          const roleVal = roleParam.replace('eq.', '');
          const filteredProfiles = mockDb.profiles.filter(p => p.role === roleVal);
          return route.fulfill({
            status: 200,
            headers: corsHeaders,
            contentType: 'application/json',
            body: JSON.stringify(filteredProfiles)
          });
        }
        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(mockDb.profiles)
        });
      }

      if (table === 'jobs') {
        const employeeIdParam = searchParams.get('employee_id');
        const clientEmailParam = searchParams.get('client_email');
        let filteredJobs = [...mockDb.jobs];

        if (employeeIdParam) {
          const empId = employeeIdParam.replace('eq.', '');
          filteredJobs = filteredJobs.filter(j => j.employee_id === empId);
        }
        if (clientEmailParam) {
          const email = clientEmailParam.replace('eq.', '');
          filteredJobs = filteredJobs.filter(j => j.client_email === email);
        }

        // Hydrate employee object inside job
        const hydratedJobs = filteredJobs.map(j => {
          const emp = mockDb.profiles.find(p => p.id === j.employee_id);
          return { ...j, employee: emp || null };
        });

        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(hydratedJobs)
        });
      }

      if (table === 'checklist_items') {
        const jobIdParam = searchParams.get('job_id');
        let items = [...mockDb.checklist_items];
        if (jobIdParam) {
          const jId = jobIdParam.replace('eq.', '');
          items = items.filter(i => i.job_id === jId);
        }
        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(items)
        });
      }

      if (table === 'rates') {
        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(mockDb.rates)
        });
      }

      if (table === 'promo_codes') {
        const codeParam = searchParams.get('code');
        let promo = [...mockDb.promo_codes];
        if (codeParam) {
          const codeVal = codeParam.replace('eq.', '');
          promo = promo.filter(p => p.code === codeVal);
        }
        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(promo)
        });
      }
    }

    if (method === 'POST') {
      if (table === 'profiles') {
        const items = Array.isArray(body) ? body : [body];
        for (const item of items) {
          const idx = mockDb.profiles.findIndex(p => p.id === item.id);
          if (idx > -1) {
            mockDb.profiles[idx] = { ...mockDb.profiles[idx], ...item };
          } else {
            mockDb.profiles.push(item);
          }
        }
        return route.fulfill({
          status: 201,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(body)
        });
      }

      if (table === 'jobs') {
        const items = Array.isArray(body) ? body : [body];
        const inserted = [];
        for (const item of items) {
          const newJob = {
            id: item.id || `job-uuid-${Math.random().toString(36).substr(2, 9)}`,
            client_name: item.client_name,
            client_email: item.client_email,
            client_phone: item.client_phone,
            address: item.address,
            service_package: item.service_package,
            scheduled_at: item.scheduled_at,
            price: item.price,
            status: item.status || 'pending',
            payment_status: item.payment_status || 'unpaid',
            employee_id: item.employee_id || null,
            rating: item.rating || null,
            tip_amount: item.tip_amount || null,
            completed_photos: item.completed_photos || []
          };
          mockDb.jobs.push(newJob);
          inserted.push(newJob);
        }
        return route.fulfill({
          status: 201,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(Array.isArray(body) ? inserted : inserted[0])
        });
      }

      if (table === 'checklist_items') {
        const items = Array.isArray(body) ? body : [body];
        const inserted = [];
        for (const item of items) {
          const newItem = {
            id: item.id || `task-uuid-${Math.random().toString(36).substr(2, 9)}`,
            job_id: item.job_id,
            task_description: item.task_description,
            is_completed: item.is_completed || false,
            completed_at: item.completed_at || null,
            completed_by: item.completed_by || null
          };
          mockDb.checklist_items.push(newItem);
          inserted.push(newItem);
        }
        return route.fulfill({
          status: 201,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify(Array.isArray(body) ? inserted : inserted[0])
        });
      }
    }

    if (method === 'PATCH') {
      if (table === 'jobs') {
        const idParam = searchParams.get('id');
        if (idParam) {
          const idVal = idParam.replace('eq.', '');
          const idx = mockDb.jobs.findIndex(j => j.id === idVal);
          if (idx > -1) {
            mockDb.jobs[idx] = { ...mockDb.jobs[idx], ...body };
            return route.fulfill({
              status: 200,
              headers: corsHeaders,
              contentType: 'application/json',
              body: JSON.stringify([mockDb.jobs[idx]])
            });
          }
        }
      }

      if (table === 'checklist_items') {
        const idParam = searchParams.get('id');
        if (idParam) {
          const idVal = idParam.replace('eq.', '');
          const idx = mockDb.checklist_items.findIndex(item => item.id === idVal);
          if (idx > -1) {
            mockDb.checklist_items[idx] = { ...mockDb.checklist_items[idx], ...body };
            return route.fulfill({
              status: 200,
              headers: corsHeaders,
              contentType: 'application/json',
              body: JSON.stringify([mockDb.checklist_items[idx]])
            });
          }
        }
      }

      if (table === 'rates') {
        const packageTypeParam = searchParams.get('package_type');
        if (packageTypeParam) {
          const pkgType = packageTypeParam.replace('eq.', '');
          const idx = mockDb.rates.findIndex(r => r.package_type === pkgType);
          if (idx > -1) {
            mockDb.rates[idx] = { ...mockDb.rates[idx], ...body, updated_at: new Date().toISOString() };
            return route.fulfill({
              status: 200,
              headers: corsHeaders,
              contentType: 'application/json',
              body: JSON.stringify([mockDb.rates[idx]])
            });
          }
        }
      }
    }

    if (method === 'DELETE') {
      if (table === 'checklist_items') {
        const idParam = searchParams.get('id');
        if (idParam) {
          const idVal = idParam.replace('eq.', '');
          mockDb.checklist_items = mockDb.checklist_items.filter(item => item.id !== idVal);
          return route.fulfill({
            status: 204,
            headers: corsHeaders
          });
        }
      }
    }

    // Default fallback error status for unhandled endpoints
    return route.fulfill({
      status: 404,
      headers: corsHeaders,
      contentType: 'application/json',
      body: JSON.stringify({ error: `Not Found: Mock database does not handle ${method} /rest/v1/${table}` })
    });
  });
}
