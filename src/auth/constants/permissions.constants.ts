export const PERMISSIONS = {
  INCIDENT: {
    CREATE: 'incident.create',
    UPDATE_OWN: 'incident.update.own',
    UPDATE_ANY: 'incident.update.any',
    VIEW_OWN: 'incident.view.own',
    VIEW_SITE: 'incident.view.site',
    APPROVE: 'incident.approve',
    CLOSE: 'incident.close',
  },

  SHIFT: {
    VIEW_OWN: 'shift.view.own',
    VIEW_TEAM: 'shift.view.team',
    ASSIGN: 'shift.assign',
    CHECKIN: 'shift.checkin',
    CHECKOUT: 'shift.checkout',
  },

  PATROL: {
    EXECUTE: 'patrol.execute',
    VIEW_TEAM: 'patrol.view.team',
    OVERRIDE: 'patrol.override',
  },

  REPORT: {
    SUBMIT: 'report.submit',
    VIEW_OWN: 'report.view.own',
    VIEW_TEAM: 'report.view.team',
    APPROVE: 'report.approve',
  },

  USER: {
    VIEW: 'user.view',
    CREATE: 'user.create',
    UPDATE: 'user.update',
    DEACTIVATE: 'user.deactivate',
  },

  SITE: {
    VIEW: 'site.view',
    CREATE: 'site.create',
    UPDATE: 'site.update',
    DELETE: 'site.delete',
  },

  SYSTEM: {
    CONFIGURE: 'system.configure',
    AUDIT_VIEW: 'audit.view',
    INTEGRATION_MANAGE: 'integration.manage',
  },
} as const;

const allPermissions = Object.values(PERMISSIONS)
  .map((group) => Object.values(group))
  .flat();

//type NestedKeyOf<ObjectType extends object> = {};
//type Permission = NestedKeyOf<typeof PERMISSIONS>;

// type PermissionGroup = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type Permission = (typeof allPermissions)[number];
