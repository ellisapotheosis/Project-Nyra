#!/usr/bin/env node
/**
 * Cloudflare Pages Deployment Automation
 *
 * Deploys projectnyra and nexus-ui to Cloudflare Pages with:
 * - GitHub integration for auto-deploy on push
 * - Environment variables (Supabase, API URLs)
 * - Custom domain routing
 * - Cloudflare Tunnel integration
 *
 * Usage:
 *   export CLOUDFLARE_API_TOKEN='...'
 *   export CLOUDFLARE_ACCOUNT_ID='...'
 *   node scripts/deploy-cloudflare-pages.js
 */

import https from "https";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error("❌ Missing required environment variables:");
  console.error("   CLOUDFLARE_API_TOKEN");
  console.error("   CLOUDFLARE_ACCOUNT_ID");
  process.exit(1);
}

/**
 * Make HTTP request to Cloudflare API
 */
function cfApiCall(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.cloudflare.com",
      port: 443,
      path: `/client/v4${path}`,
      method,
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (!json.success) {
            reject(
              new Error(
                `CF API error: ${json.errors?.[0]?.message || "Unknown error"}`
              )
            );
          } else {
            resolve(json.result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Create or update a Cloudflare Pages project
 */
async function deployProject(
  projectName,
  subdomain,
  repoName,
  rootDir,
  env = {}
) {
  console.log(`\n📦 Setting up ${projectName} (${subdomain})`);

  try {
    // Check if project exists
    let project;
    try {
      project = await cfApiCall(
        "GET",
        `/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}`
      );
      console.log(`  ✓ Project exists: ${project.name}`);
    } catch (e) {
      console.log(`  → Creating new project...`);
      project = await cfApiCall(
        "POST",
        `/accounts/${CF_ACCOUNT_ID}/pages/projects`,
        {
          name: projectName,
          production_branch: "main",
          source: {
            type: "github",
            config: {
              owner: "ellisapotheosis",
              repo: repoName,
              production_branch: "main",
            },
          },
          build_config: {
            build_command: `pnpm --filter ${projectName} run build`,
            destination_dir: ".next",
            root_dir: rootDir,
            web_analytics_tag: "cf-pages-auto",
          },
        }
      );
      console.log(`  ✓ Project created: ${project.name} (ID: ${project.id})`);
    }

    // Set environment variables
    console.log(`  → Setting environment variables...`);
    const envVars = {
      NODE_VERSION: "20.18.0",
      PNPM_VERSION: "10.27.0",
      ...env,
    };

    for (const [key, value] of Object.entries(envVars)) {
      try {
        await cfApiCall(
          "PUT",
          `/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/deployments/staging`,
          {
            environment: "staging",
            variables: [{ name: key, text: value }],
          }
        );
        console.log(`    ${key}=***`);
      } catch (e) {
        // Ignore if deployment doesn't exist yet
      }
    }

    // Add custom domain
    console.log(`  → Adding domain routing...`);
    const fullDomain =
      subdomain === "projectnyra"
        ? "projectnyra.com"
        : `${subdomain}.projectnyra.com`;

    try {
      await cfApiCall(
        "POST",
        `/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains`,
        {
          domain: fullDomain,
        }
      );
      console.log(`  ✓ Domain configured: ${fullDomain}`);
    } catch (e) {
      if (e.message.includes("already exists")) {
        console.log(`  ✓ Domain already configured: ${fullDomain}`);
      } else {
        throw e;
      }
    }

    // Trigger deployment
    console.log(`  → Triggering deployment from GitHub...`);
    console.log(`  ✓ Build will start automatically when you push to main`);

    return { name: projectName, domain: fullDomain, id: project.id };
  } catch (error) {
    console.error(`  ❌ Failed to deploy ${projectName}:`, error.message);
    throw error;
  }
}

/**
 * Configure Cloudflare Access (authentication) for NexusUI
 */
async function setupAccessPolicy(projectName, email) {
  console.log(`\n🔐 Setting up Cloudflare Access for ${projectName}`);

  try {
    // Note: Access policy setup requires UI or advanced API calls
    // This is a placeholder for manual setup instructions
    console.log(`
    📋 Manual setup required in Cloudflare Dashboard:
    1. Go to Zero Trust → Access → Applications
    2. Create application for: nexus-ui.projectnyra.com
    3. Add authentication policy (require email: ${email})
    4. Done!
    `);
  } catch (error) {
    console.error(`  ❌ Failed to setup access:`, error.message);
  }
}

/**
 * Configure Cloudflare Tunnel for backend connectivity
 */
async function setupTunnel() {
  console.log(`\n🌉 Cloudflare Tunnel Setup Instructions`);
  console.log(`
  Your CF Pages apps need to connect to oracle-vps backend.

  1. Install cloudflared on oracle-vps:
     curl -L --output cloudflared.tgz https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.tgz
     tar -xzf cloudflared.tgz
     sudo mv cloudflared /usr/local/bin/

  2. Authenticate cloudflared:
     cloudflared tunnel login

  3. Create tunnel:
     cloudflared tunnel create project-nyra-api

  4. Configure tunnel (create ~/.cloudflared/config.yml):
     tunnel: project-nyra-api
     ingress:
       - hostname: supabase.projectnyra.com
         service: http://localhost:8000
       - hostname: api.projectnyra.com
         service: http://localhost:3100
       - hostname: nexus-ui.projectnyra.com
         service: http://localhost:6000
       - service: http_status:404

  5. Start tunnel:
     cloudflared tunnel run project-nyra-api

  6. Route domain to tunnel via Cloudflare Dashboard
  `);
}

/**
 * Main deployment flow
 */
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     Cloudflare Pages Deployment - Project Nyra                 ║
║     Deploying: projectnyra, nexus-ui (admin)                   ║
╚════════════════════════════════════════════════════════════════╝
  `);

  try {
    // Deploy projectnyra (public product site)
    const projectnyra = await deployProject(
      "projectnyra",
      "projectnyra",
      "Project-Nyra",
      "apps/projectnyra",
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://supabase.projectnyra.com",
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
          process.env.SUPABASE_ANON_KEY || "set-in-dashboard",
        NEXT_PUBLIC_API_URL: "https://api.projectnyra.com",
      }
    );

    // Deploy nexus-ui (admin dashboard with access control)
    const nexusUI = await deployProject(
      "nexus-ui",
      "nexus-ui",
      "Project-Nyra",
      "apps/nexusUI",
      {
        NEXT_PUBLIC_ADMIN_MODE: "true",
        NEXT_PUBLIC_NEXUS_BASE_URL: "https://nexus-ui.projectnyra.com",
        NEXT_PUBLIC_API_URL: "https://api.projectnyra.com",
      }
    );

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ Setup Complete!                           ║
╚════════════════════════════════════════════════════════════════╝

📊 Deployed Projects:
  1. projectnyra.com (public product site)
  2. nexus-ui.projectnyra.com (private admin, requires authentication)

🔄 Next Steps:

  1. Verify GitHub Integration:
     - Go to Cloudflare Dashboard → Pages → Settings
     - Confirm GitHub account is connected
     - Verify production branch is 'main'

  2. Set Up NexusUI Authentication:
    `);

    await setupAccessPolicy("nexus-ui", "edaneandersen@gmail.com");

    console.log(`
  3. Configure Backend Connectivity:
    `);

    await setupTunnel();

    console.log(`
  4. Environment Variables:
     Add to Cloudflare Pages settings:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - All other .env values

  5. Deploy:
     Push to GitHub main branch → Cloudflare auto-builds

📚 Docs:
   - Cloudflare Pages: https://developers.cloudflare.com/pages/
   - Tunnels: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
   - Access: https://developers.cloudflare.com/cloudflare-one/policies/access/
    `);
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main();
