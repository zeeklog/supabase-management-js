'use strict';

var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// node_modules/openapi-fetch/dist/index.js
var DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};
var TRAILING_SLASH_RE = /\/*$/;
function defaultQuerySerializer(q) {
  const search = new URLSearchParams();
  if (q && typeof q === "object") {
    for (const [k, v] of Object.entries(q)) {
      if (v === void 0 || v === null)
        continue;
      search.set(k, v);
    }
  }
  return search.toString();
}
function defaultBodySerializer(body) {
  return JSON.stringify(body);
}
function createFinalURL(url, options) {
  let finalURL = `${options.baseUrl ? options.baseUrl.replace(TRAILING_SLASH_RE, "") : ""}${url}`;
  if (options.params.path) {
    for (const [k, v] of Object.entries(options.params.path))
      finalURL = finalURL.replace(`{${k}}`, encodeURIComponent(String(v)));
  }
  if (options.params.query) {
    const search = options.querySerializer(options.params.query);
    if (search)
      finalURL += `?${search}`;
  }
  return finalURL;
}
function createClient(clientOptions = {}) {
  const { fetch = globalThis.fetch, querySerializer: globalQuerySerializer, bodySerializer: globalBodySerializer, ...options } = clientOptions;
  const defaultHeaders = new Headers({
    ...DEFAULT_HEADERS,
    ...options.headers ?? {}
  });
  async function coreFetch(url, fetchOptions) {
    const { headers, body: requestBody, params = {}, parseAs = "json", querySerializer = globalQuerySerializer ?? defaultQuerySerializer, bodySerializer = globalBodySerializer ?? defaultBodySerializer, ...init } = fetchOptions || {};
    const finalURL = createFinalURL(url, { baseUrl: options.baseUrl, params, querySerializer });
    const baseHeaders = new Headers(defaultHeaders);
    const headerOverrides = new Headers(headers);
    for (const [k, v] of headerOverrides.entries()) {
      if (v === void 0 || v === null)
        baseHeaders.delete(k);
      else
        baseHeaders.set(k, v);
    }
    const requestInit = {
      redirect: "follow",
      ...options,
      ...init,
      headers: baseHeaders
    };
    if (requestBody)
      requestInit.body = bodySerializer(requestBody);
    if (requestInit.body instanceof FormData)
      baseHeaders.delete("Content-Type");
    const response = await fetch(finalURL, requestInit);
    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
      return response.ok ? { data: {}, response } : { error: {}, response };
    }
    if (response.ok) {
      let data = response.body;
      if (parseAs !== "stream") {
        const cloned = response.clone();
        data = typeof cloned[parseAs] === "function" ? await cloned[parseAs]() : await cloned.text();
      }
      return { data, response };
    }
    let error = {};
    try {
      error = await response.clone().json();
    } catch {
      error = await response.clone().text();
    }
    return { error, response };
  }
  return {
    /** Call a GET endpoint */
    async get(url, init) {
      return coreFetch(url, { ...init, method: "GET" });
    },
    /** Call a PUT endpoint */
    async put(url, init) {
      return coreFetch(url, { ...init, method: "PUT" });
    },
    /** Call a POST endpoint */
    async post(url, init) {
      return coreFetch(url, { ...init, method: "POST" });
    },
    /** Call a DELETE endpoint */
    async del(url, init) {
      return coreFetch(url, { ...init, method: "DELETE" });
    },
    /** Call a OPTIONS endpoint */
    async options(url, init) {
      return coreFetch(url, { ...init, method: "OPTIONS" });
    },
    /** Call a HEAD endpoint */
    async head(url, init) {
      return coreFetch(url, { ...init, method: "HEAD" });
    },
    /** Call a PATCH endpoint */
    async patch(url, init) {
      return coreFetch(url, { ...init, method: "PATCH" });
    },
    /** Call a TRACE endpoint */
    async trace(url, init) {
      return coreFetch(url, { ...init, method: "TRACE" });
    }
  };
}

// src/api/consts.ts
var SUPABASE_API_URL = "https://api.supabase.com";

// src/index.ts
var SupabaseManagementAPIError = class extends Error {
  constructor(message, response) {
    super(message);
    this.response = response;
  }
};
function isSupabaseError(error) {
  return error instanceof SupabaseManagementAPIError;
}
var _createResponseError, createResponseError_fn;
var SupabaseManagementAPI = class {
  constructor(options) {
    this.options = options;
    __privateAdd(this, _createResponseError);
  }
  /**
   * List all organizations
   * @description Returns a list of organizations that you currently belong to.
   */
  async getOrganizations() {
    const { data, response } = await this.client.get("/v1/organizations", {});
    if (response.status !== 200) {
      throw new SupabaseManagementAPIError(
        `Failed to get organizations: ${response.statusText} (${response.status})`,
        response
      );
    }
    return data;
  }
  /** Create an organization */
  async createOrganization(body) {
    const { data, response } = await this.client.post("/v1/organizations", {
      body
    });
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "create organization");
    }
    return data;
  }
  /**
   * Get database branch config
   * @description Fetches configurations of the specified database branch
   */
  async getBranchDetails(branchId) {
    const { data, response } = await this.client.get(
      "/v1/branches/{branch_id}",
      {
        params: {
          path: {
            branch_id: branchId
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get branch details");
    }
    return data;
  }
  async deleteBranch(branchId) {
    const { response } = await this.client.del("/v1/branches/{branch_id}", {
      params: {
        path: {
          branch_id: branchId
        }
      }
    });
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "delete branch");
    }
  }
  async updateBranch(branchId, body) {
    const { data, response } = await this.client.patch(
      "/v1/branches/{branch_id}",
      {
        params: {
          path: {
            branch_id: branchId
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update branch");
    }
    return data;
  }
  /**
   * List all projects
   * @description Returns a list of all projects you've previously created.
   */
  async getProjects() {
    const { data, response } = await this.client.get("/v1/projects", {});
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get projects");
    }
    return data;
  }
  /** Create a project */
  async createProject(body) {
    const { data, response } = await this.client.post("/v1/projects", {
      body
    });
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "create project");
    }
    return data;
  }
  /** Delete a project */
  async deleteProject(ref) {
    const { data, response } = await this.client.del("/v1/projects/{ref}", {
      params: {
        path: {
          ref
        }
      }
    });
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "delete project");
    }
    return data;
  }
  /**
   * Check service health
   * @description Checks the health of the specified service.
   */
  async checkServiceHealth(ref, query) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/health",
      {
        params: {
          query,
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "check service health");
    }
    return data;
  }
  /**
   * List all functions
   * @description Returns all functions you've previously added to the specified project.
   */
  async listFunctions(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/functions",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "list functions");
    }
    return data;
  }
  /**
   * Create a function
   * @description Creates a function and adds it to the specified project.
   */
  async createFunction(ref, body) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/functions",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "create function");
    }
    return data;
  }
  /**
   * Deploy function
   * @description Deploys a function and adds it to the specified project.
   */
  async deployFunction(ref, body) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/functions/deploy",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "create function");
    }
    return data;
  }
  /**
   * Retrieve a function
   * @description Retrieves a function with the specified slug and project.
   */
  async getFunction(ref, slug) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/functions/{function_slug}",
      {
        params: {
          path: {
            ref,
            function_slug: slug
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get function");
    }
    return data;
  }
  /**
   * Update a function
   * @description Updates a function with the specified slug and project.
   */
  async updateFunction(ref, slug, body) {
    const { data, response } = await this.client.patch(
      "/v1/projects/{ref}/functions/{function_slug}",
      {
        params: {
          path: {
            ref,
            function_slug: slug
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update function");
    }
    return data;
  }
  /**
   * Delete a function
   * @description Deletes a function with the specified slug from the specified project.
   */
  async deleteFunction(ref, slug) {
    const { response } = await this.client.del(
      "/v1/projects/{ref}/functions/{function_slug}",
      {
        params: {
          path: {
            ref,
            function_slug: slug
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "delete function");
    }
  }
  /**
   * Retrieve a function body
   * @description Retrieves a function body for the specified slug and project.
   */
  async getFunctionBody(ref, slug) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/functions/{function_slug}/body",
      {
        params: {
          path: {
            ref,
            function_slug: slug
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get function body");
    }
    return data;
  }
  async getProjectApiKeys(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/api-keys",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get project api keys");
    }
    return data;
  }
  /** Gets project's custom hostname config */
  async getCustomHostnameConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/custom-hostname",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get custom hostname");
    }
    return data;
  }
  /** Deletes a project's custom hostname configuration */
  async removeCustomHostnameConfig(ref) {
    const { response } = await this.client.del(
      "/v1/projects/{ref}/custom-hostname",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "remove custom hostname config");
    }
  }
  /** Updates project's custom hostname configuration */
  async createCustomHostnameConfig(ref, body) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/custom-hostname/initialize",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "create custom hostname config");
    }
    return data;
  }
  /** Attempts to verify the DNS configuration for project's custom hostname configuration */
  async reverifyCustomHostnameConfig(ref) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/custom-hostname/reverify",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "reverify custom hostname config");
    }
    return data;
  }
  /** Activates a custom hostname for a project. */
  async activateCustomHostnameConfig(ref) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/custom-hostname/activate",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "activate custom hostname config");
    }
    return data;
  }
  /** Gets project's network bans */
  async getNetworkBans(ref) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/network-bans/retrieve",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get network bans");
    }
    return data;
  }
  /** Remove network bans. */
  async removeNetworkBan(ref, body) {
    const { response } = await this.client.del(
      "/v1/projects/{ref}/network-bans",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "remove network ban");
    }
  }
  /** Gets project's network restrictions */
  async getNetworkRestrictions(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/network-restrictions",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get network restrictions");
    }
    return data;
  }
  /** Updates project's network restrictions */
  async applyNetworkRestrictions(ref, body) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/network-restrictions/apply",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "apply network restrictions");
    }
    return data;
  }
  /** Gets project's pgsodium config */
  async getPgsodiumConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/pgsodium",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get pg sodium config");
    }
    return data;
  }
  /** Updates project's pgsodium config. Updating the root_key can cause all data encrypted with the older key to become inaccessible. */
  async updatePgSodiumConfig(ref, body) {
    const { data, response } = await this.client.put(
      "/v1/projects/{ref}/pgsodium",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update pg sodium config");
    }
    return data;
  }
  /** Gets project's postgrest config */
  async getPostgRESTConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/postgrest",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get postgrest config");
    }
    return data;
  }
  /** Updates project's postgrest config */
  async updatePostgRESTConfig(ref, body) {
    const { data, response } = await this.client.patch(
      "/v1/projects/{ref}/postgrest",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update postgrest config");
    }
    return data;
  }
  /** Run sql query */
  async runQuery(ref, query) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/database/query",
      {
        params: {
          path: {
            ref
          }
        },
        body: {
          query
        }
      }
    );
    if (response.status !== 201 && response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "run query");
    }
    return data;
  }
  async enableWebhooks(ref) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/database/webhooks/enable",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "enable webhooks");
    }
  }
  /**
   * List all secrets
   * @description Returns all secrets you've previously added to the specified project.
   */
  async getSecrets(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/secrets",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get secrets");
    }
    return data;
  }
  /**
   * Bulk create secrets
   * @description Creates multiple secrets and adds them to the specified project.
   */
  async createSecrets(ref, body) {
    const { response } = await this.client.post("/v1/projects/{ref}/secrets", {
      params: {
        path: {
          ref
        }
      },
      body
    });
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "create secrets");
    }
  }
  /**
   * Bulk delete secrets
   * @description Deletes all secrets with the given names from the specified project
   */
  async deleteSecrets(ref, body) {
    const { data, response } = await this.client.del(
      "/v1/projects/{ref}/secrets",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "delete secrets");
    }
    return data;
  }
  /** Get project's SSL enforcement configuration. */
  async getSSLEnforcementConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/ssl-enforcement",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get ssl enforcement config");
    }
    return data;
  }
  /** Update project's SSL enforcement configuration. */
  async updateSSLEnforcementConfig(ref, body) {
    const { data, response } = await this.client.put(
      "/v1/projects/{ref}/ssl-enforcement",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update ssl enforcement config");
    }
    return data;
  }
  /**
   * Generate TypeScript types
   * @description Returns the TypeScript types of your schema for use with supabase-js.
   */
  async getTypescriptTypes(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/types/typescript",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get typescript types");
    }
    return data;
  }
  /** Gets current vanity subdomain config */
  async getVanitySubdomainConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/vanity-subdomain",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get vanity subdomain config");
    }
    return data;
  }
  /** Deletes a project's vanity subdomain configuration */
  async removeVanitySubdomainConfig(ref) {
    const { response } = await this.client.del(
      "/v1/projects/{ref}/vanity-subdomain",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "remove vanity subdomain config");
    }
  }
  /** Checks vanity subdomain availability */
  async checkVanitySubdomainAvailability(ref, subdomain) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/vanity-subdomain/check-availability",
      {
        params: {
          path: {
            ref
          }
        },
        body: {
          vanity_subdomain: subdomain
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "check vanity subdomain availability");
    }
    return typeof data === "undefined" ? false : data.available;
  }
  /** Activates a vanity subdomain for a project. */
  async activateVanitySubdomainPlease(ref, subdomain) {
    const { response, data } = await this.client.post(
      "/v1/projects/{ref}/vanity-subdomain/activate",
      {
        params: {
          path: {
            ref
          }
        },
        body: {
          vanity_subdomain: subdomain
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "activate vanity subdomain");
    }
    return data?.custom_domain;
  }
  /** Upgrades the project's Postgres version */
  async upgradeProject(ref, targetVersion) {
    const { response } = await this.client.post("/v1/projects/{ref}/upgrade", {
      params: {
        path: {
          ref
        }
      },
      body: {
        target_version: targetVersion
      }
    });
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "upgrade project");
    }
  }
  /** Returns the project's eligibility for upgrades */
  async getUpgradeEligibility(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/upgrade/eligibility",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get upgrade eligibility");
    }
    return data;
  }
  /** Gets the latest status of the project's upgrade */
  async getUpgradeStatus(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/upgrade/status",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get upgrade status");
    }
    return data;
  }
  /** Returns project's readonly mode status */
  async getReadOnlyModeStatus(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/readonly",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get readonly mode status");
    }
    return data;
  }
  /** Disables project's readonly mode for the next 15 minutes */
  async temporarilyDisableReadonlyMode(ref) {
    const { response } = await this.client.post(
      "/v1/projects/{ref}/readonly/temporary-disable",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "temporarily disable readonly mode");
    }
  }
  /** Gets project's Postgres config */
  async getPGConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/config/database/postgres",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get PG config");
    }
    return data;
  }
  /** Updates project's Postgres config */
  async updatePGConfig(ref, body) {
    const { data, response } = await this.client.put(
      "/v1/projects/{ref}/config/database/postgres",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update PG config");
    }
    return data;
  }
  /** Gets project's pgbouncer config */
  async getPgBouncerConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/config/database/pgbouncer",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get Pgbouncer config");
    }
    return data;
  }
  /** Gets project's auth config */
  async getProjectAuthConfig(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/config/auth",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get project auth config");
    }
    return data;
  }
  /** Updates a project's auth config */
  async updateProjectAuthConfig(ref, body) {
    const { data, response } = await this.client.patch(
      "/v1/projects/{ref}/config/auth",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update project auth config");
    }
    return data;
  }
  /** Lists all SSO providers */
  async getSSOProviders(ref) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/config/auth/sso/providers",
      {
        params: {
          path: {
            ref
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get SSO providers");
    }
    return data;
  }
  /** Creates a new SSO provider */
  async createSSOProvider(ref, body) {
    const { data, response } = await this.client.post(
      "/v1/projects/{ref}/config/auth/sso/providers",
      {
        params: {
          path: {
            ref
          }
        },
        body
      }
    );
    if (response.status !== 201) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "create SSO provider");
    }
    return data;
  }
  /** Gets a SSO provider by its UUID */
  async getSSOProvider(ref, uuid) {
    const { data, response } = await this.client.get(
      "/v1/projects/{ref}/config/auth/sso/providers/{provider_id}",
      {
        params: {
          path: {
            ref,
            provider_id: uuid
          }
        }
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get SSO provider");
    }
    return data;
  }
  /** Updates a SSO provider by its UUID */
  async updateSSOProvider(ref, uuid, body) {
    const { data, response } = await this.client.put(
      "/v1/projects/{ref}/config/auth/sso/providers/{provider_id}",
      {
        params: {
          path: {
            ref,
            provider_id: uuid
          }
        },
        body
      }
    );
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "update SSO provider");
    }
    return data;
  }
  /** Removes a SSO provider by its UUID */
  async deleteSSOProvider(ref, uuid) {
    const { response } = await this.client.del(
      "/v1/projects/{ref}/config/auth/sso/providers/{provider_id}",
      {
        params: {
          path: {
            ref,
            provider_id: uuid
          }
        }
      }
    );
    if (response.status !== 204) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "delete SSO provider");
    }
  }
  /** List snippets */
  async listSnippets(projectRef) {
    const { data, response } = await this.client.get("/v1/snippets", {
      params: {
        query: {
          project_ref: projectRef
        }
      }
    });
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "list snippets");
    }
    return data;
  }
  async getSnippet(id) {
    const { data, response } = await this.client.get("/v1/snippets/{id}", {
      params: {
        path: {
          id
        }
      }
    });
    if (response.status !== 200) {
      throw await __privateMethod(this, _createResponseError, createResponseError_fn).call(this, response, "get snippet");
    }
    return data;
  }
  get client() {
    return createClient({
      baseUrl: this.options.baseUrl || SUPABASE_API_URL,
      headers: {
        Authorization: `Bearer ${this.options.accessToken}`
      }
    });
  }
};
_createResponseError = new WeakSet();
createResponseError_fn = async function(response, action) {
  const errorBody = await safeParseErrorResponseBody(response);
  return new SupabaseManagementAPIError(
    `Failed to ${action}: ${response.statusText} (${response.status})${errorBody ? `: ${errorBody.message}` : ""}`,
    response
  );
};
async function safeParseErrorResponseBody(response) {
  try {
    const body = await response.json();
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
      return { message: body.message };
    }
  } catch (error) {
    return;
  }
}

exports.SupabaseManagementAPI = SupabaseManagementAPI;
exports.SupabaseManagementAPIError = SupabaseManagementAPIError;
exports.isSupabaseError = isSupabaseError;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map