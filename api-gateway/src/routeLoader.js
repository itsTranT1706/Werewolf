const axios = require('axios');
const express = require('express');
const routesConfig = require('../config/routes.json');

/**
 * Proxy request to target service
 */
async function proxyRequest(req, res, targetUrl, serviceName, routePath) {
  try {
    console.log(`[PROXY] ${req.method} ${req.path} -> ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log(`[PROXY RESPONSE] ${response.status} from ${serviceName}${routePath}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[PROXY ERROR] ${serviceName}:`, error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(502).json({
        error: 'Bad Gateway',
        service: serviceName,
        details: error.message
      });
    }
  }
}

/**
 * Setup routes from configuration
 */
function setupRoutes(app) {
  const { proxy } = routesConfig;

  Object.entries(proxy).forEach(([serviceName, serviceConfig]) => {
    const { target, routes } = serviceConfig;
    const targetUrl = process.env[`${serviceName.toUpperCase().replace('-', '_')}_URL`] || target;

    routes.forEach(route => {
      const { path, method, targetPath, public: isPublic } = route;

      // Convert {param} to :param for Express routing
      const expressPath = path.replace(/\{(\w+)\}/g, ':$1');

      // Determine Express method
      const expressMethod = method.toLowerCase() === 'all' ? 'all' : method.toLowerCase();

      // Create handler
      const handler = async (req, res) => {
        // Build target URL - replace {param} with actual values from req.params
        let finalTargetPath = targetPath;
        
        // Replace path parameters
        Object.entries(req.params).forEach(([key, value]) => {
          finalTargetPath = finalTargetPath.replace(`{${key}}`, value);
        });

        if (targetPath.includes('*')) {
          // Handle wildcard routes
          const basePath = path.replace('*', '');
          const remainingPath = req.path.replace(basePath, '');
          finalTargetPath = targetPath.replace('*', remainingPath);
        }

        const fullTargetUrl = `${targetUrl}${finalTargetPath}`;
        await proxyRequest(req, res, fullTargetUrl, serviceName, finalTargetPath);
      };

      // Register route with Express
      app[expressMethod](expressPath, express.json(), handler);

      console.log(`[ROUTE] Registered ${method} ${expressPath} -> ${serviceName}${targetPath} (public: ${isPublic})`);
    });
  });
}

/**
 * Get list of public paths for auth middleware
 */
function getPublicPaths() {
  const publicPaths = ['/health'];
  const { proxy } = routesConfig;

  Object.values(proxy).forEach(serviceConfig => {
    serviceConfig.routes.forEach(route => {
      if (route.public) {
        publicPaths.push(route.path);
      }
    });
  });

  return publicPaths;
}

module.exports = {
  setupRoutes,
  getPublicPaths,
};
