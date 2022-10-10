SET @now = NOW();

INSERT INTO casbin_rule (id, ptype, v0, v1, v2, v3, v4, v5)
VALUES (1, 'p', 'action::1', '/dashboard/', '', '', '', ''),
       (2, 'p', 'action::1000', '/projects/', '', '', '', ''),
       (3, 'p', 'action::1100', '/projects', '', '', '', ''),
       (4, 'p', 'action::2000', '/deploys/', '', '', '', ''),
       (5, 'p', 'action::2100', '/apps', '', '', '', ''),
       (6, 'p', 'action::2200', '/configs', '', '', '', ''),
       (7, 'p', 'action::2300', '/var_sets', '', '', '', ''),
       (8, 'p', 'action::3000', '/operations/', '', '', '', ''),
       (9, 'p', 'action::3100', '/clusters', '', '', '', ''),
       (10, 'p', 'action::3200', '/envs', '', '', '', ''),
       (11, 'p', 'action::3300', '/env_sets', '', '', '', ''),
       (12, 'p', 'action::3400', '/labels', '', '', '', ''),
       (13, 'p', 'action::3500', '/templates', '', '', '', ''),
       (14, 'p', 'action::9000', '/settings/', '', '', '', ''),
       (15, 'p', 'action::9100', '/settings/users', '', '', '', ''),
       (16, 'p', 'action::9101', '/api/v1/users', 'POST', '', '', ''),
       (17, 'p', 'action::9102', '/api/v1/users/:id', 'PUT', '', '', ''),
       (18, 'p', 'action::9103', '/api/v1/users/:id', 'DELETE', '', '', ''),
       (19, 'p', 'action::9104', '/api/v1/users', 'GET', '', '', ''),
       (20, 'p', 'action::9105', '/api/v1/users/:id/password', 'PUT', '', '', ''),
       (21, 'p', 'action::9200', '/settings/groups', '', '', '', ''),
       (22, 'p', 'action::9201', '/api/v1/groups', 'POST', '', '', ''),
       (23, 'p', 'action::9202', '/api/v1/groups/:id', 'PUT', '', '', ''),
       (24, 'p', 'action::9203', '/api/v1/groups/:id', 'DELETE', '', '', ''),
       (25, 'p', 'action::9204', '/api/v1/groups', 'GET', '', '', ''),
       (26, 'p', 'action::9205', '/api/v1/groups/:id', 'GET', '', '', ''),
       (27, 'p', 'action::9300', '/settings/roles', '', '', '', ''),
       (28, 'p', 'action::9301', '/api/v1/roles', 'POST', '', '', ''),
       (29, 'p', 'action::9302', '/api/v1/roles/:id', 'PUT', '', '', ''),
       (30, 'p', 'action::9303', '/api/v1/roles/:id', 'DELETE', '', '', ''),
       (31, 'p', 'action::9304', '/api/v1/roles', 'GET', '', '', ''),
       (32, 'p', 'action::9305', '/api/v1/roles/:id/menus', 'GET', '', '', ''),
       (33, 'p', 'action::9306', '/api/v1/roles/:id/menus', 'PUT', '', '', ''),
       (34, 'g', 'role::1', 'action::1', '', '', '', ''),
       (35, 'g', 'role::1', 'action::1000', '', '', '', ''),
       (36, 'g', 'role::1', 'action::1100', '', '', '', ''),
       (37, 'g', 'role::1', 'action::2000', '', '', '', ''),
       (38, 'g', 'role::1', 'action::2100', '', '', '', ''),
       (39, 'g', 'role::1', 'action::2200', '', '', '', ''),
       (40, 'g', 'role::1', 'action::2300', '', '', '', ''),
       (41, 'g', 'role::1', 'action::3000', '', '', '', ''),
       (42, 'g', 'role::1', 'action::3100', '', '', '', ''),
       (43, 'g', 'role::1', 'action::3200', '', '', '', ''),
       (44, 'g', 'role::1', 'action::3300', '', '', '', ''),
       (45, 'g', 'role::1', 'action::3400', '', '', '', ''),
       (46, 'g', 'role::1', 'action::3500', '', '', '', ''),
       (47, 'g', 'role::1', 'action::9000', '', '', '', ''),
       (48, 'g', 'role::1', 'action::9100', '', '', '', ''),
       (49, 'g', 'role::1', 'action::9101', '', '', '', ''),
       (50, 'g', 'role::1', 'action::9102', '', '', '', ''),
       (51, 'g', 'role::1', 'action::9103', '', '', '', ''),
       (52, 'g', 'role::1', 'action::9104', '', '', '', ''),
       (53, 'g', 'role::1', 'action::9105', '', '', '', ''),
       (54, 'g', 'role::1', 'action::9200', '', '', '', ''),
       (55, 'g', 'role::1', 'action::9201', '', '', '', ''),
       (56, 'g', 'role::1', 'action::9202', '', '', '', ''),
       (57, 'g', 'role::1', 'action::9203', '', '', '', ''),
       (58, 'g', 'role::1', 'action::9204', '', '', '', ''),
       (59, 'g', 'role::1', 'action::9205', '', '', '', ''),
       (60, 'g', 'role::1', 'action::9300', '', '', '', ''),
       (61, 'g', 'role::1', 'action::9301', '', '', '', ''),
       (62, 'g', 'role::1', 'action::9302', '', '', '', ''),
       (63, 'g', 'role::1', 'action::9303', '', '', '', ''),
       (64, 'g', 'role::1', 'action::9304', '', '', '', ''),
       (65, 'g', 'role::1', 'action::9305', '', '', '', ''),
       (66, 'g', 'role::1', 'action::9306', '', '', '', ''),
       (67, 'g', 'group::1', 'role::1', '', '', '', ''),
       (68, 'g', 'user::1', 'role::1', '', '', '', '');

INSERT INTO magi_menu (id, created_at, updated_at, deleted_at, locale, path, method, type, icon, parent_id, order_id)
VALUES (1, @now, @now, NULL, 'menu_dashboard', '/dashboard', '', 1, 'HomeOutlined', 0, 1),
       (1000, @now, @now, NULL, 'menu_project', '/projects/', '', 1, 'ProjectOutlined', 0, 1000),
       (1100, @now, @now, NULL, 'menu_project', '/projects', '', 2, '', 1000, 1100),
       (2000, @now, @now, NULL, 'menu_deploy', '/deploys/', '', 1, 'ClusterOutlined', 0, 2000),
       (2100, @now, @now, NULL, 'menu_app', '/apps', '', 2, '', 2000, 2100),
       (2200, @now, @now, NULL, 'menu_config', '/configs', '', 2, '', 2000, 2200),
       (2300, @now, @now, NULL, 'menu_var_set', '/var_sets', '', 2, '', 2000, 2300),
       (3000, @now, @now, NULL, 'menu_operation', '/operations/', '', 1, 'ControlOutlined', 0, 3000),
       (3100, @now, @now, NULL, 'menu_cluster', '/clusters', '', 2, '', 3000, 3100),
       (3200, @now, @now, NULL, 'menu_env', '/envs', '', 2, '', 3000, 3200),
       (3300, @now, @now, NULL, 'menu_env_set', '/env_sets', '', 2, '', 3000, 3300),
       (3400, @now, @now, NULL, 'menu_label', '/labels', '', 2, '', 3000, 3400),
       (3500, @now, @now, NULL, 'menu_template', '/templates', '', 2, '', 3000, 3500),
       (9000, @now, @now, NULL, 'menu_setting', '/settings', '', 1, 'SettingOutlined', 0, 9000),
       (9100, @now, @now, NULL, 'menu_user', '/settings/users', '', 2, '', 9000, 9100),
       (9101, @now, @now, NULL, 'menu_create_user', '/api/v1/users', 'POST', 3, '', 9100, 9101),
       (9102, @now, @now, NULL, 'menu_edit_user', '/api/v1/users/:id', 'PUT', 3, '', 9100, 9102),
       (9103, @now, @now, NULL, 'menu_delete_user', '/api/v1/users/:id', 'DELETE', 3, '', 9100, 9103),
       (9104, @now, @now, NULL, 'menu_user_list', '/api/v1/users', 'GET', 3, '', 9100, 9104),
       (9105, @now, @now, NULL, 'menu_user_reset_password', '/api/v1/users/:id/password', 'PUT', 3, '', 9100, 9105),
       (9200, @now, @now, NULL, 'menu_group', '/settings/groups', '', 2, '', 9000, 9200),
       (9201, @now, @now, NULL, 'menu_create_group', '/api/v1/groups', 'POST', 3, '', 9200, 9201),
       (9202, @now, @now, NULL, 'menu_edit_group', '/api/v1/groups/:id', 'PUT', 3, '', 9200, 9202),
       (9203, @now, @now, NULL, 'menu_delete_group', '/api/v1/groups/:id', 'DELETE', 3, '', 9200, 9203),
       (9204, @now, @now, NULL, 'menu_group_list', '/api/v1/groups', 'GET', 3, '', 9200, 9204),
       (9205, @now, @now, NULL, 'menu_group_detail', '/api/v1/groups/:id', 'GET', 3, '', 9200, 9205),
       (9300, @now, @now, NULL, 'menu_role', '/settings/roles', '', 2, '', 9000, 9300),
       (9301, @now, @now, NULL, 'menu_create_role', '/api/v1/roles', 'POST', 3, '', 9300, 9301),
       (9302, @now, @now, NULL, 'menu_edit_role', '/api/v1/roles/:id', 'PUT', 3, '', 9300, 9302),
       (9303, @now, @now, NULL, 'menu_delete_role', '/api/v1/roles/:id', 'DELETE', 3, '', 9300, 9303),
       (9304, @now, @now, NULL, 'menu_role_list', '/api/v1/roles', 'GET', 3, '', 9300, 9304),
       (9305, @now, @now, NULL, 'menu_edit_permission', '/api/v1/roles/:id/menus', 'PUT', 3, '', 9300, 9305),
       (9306, @now, @now, NULL, 'menu_permission_list', '/api/v1/roles/:id/menus', 'GET', 3, '', 9300, 9306);

INSERT INTO magi_role_menu (id, created_at, updated_at, deleted_at, role_id, menu_id)
VALUES (1, @now, @now, NULL, 1, 1),
       (2, @now, @now, NULL, 1, 1000),
       (3, @now, @now, NULL, 1, 1100),
       (4, @now, @now, NULL, 1, 2000),
       (5, @now, @now, NULL, 1, 2100),
       (6, @now, @now, NULL, 1, 2200),
       (7, @now, @now, NULL, 1, 2300),
       (8, @now, @now, NULL, 1, 3000),
       (9, @now, @now, NULL, 1, 3100),
       (10, @now, @now, NULL, 1, 3200),
       (11, @now, @now, NULL, 1, 3300),
       (12, @now, @now, NULL, 1, 3400),
       (13, @now, @now, NULL, 1, 3500),
       (14, @now, @now, NULL, 1, 9000),
       (15, @now, @now, NULL, 1, 9100),
       (16, @now, @now, NULL, 1, 9101),
       (17, @now, @now, NULL, 1, 9102),
       (18, @now, @now, NULL, 1, 9103),
       (19, @now, @now, NULL, 1, 9104),
       (20, @now, @now, NULL, 1, 9105),
       (21, @now, @now, NULL, 1, 9200),
       (22, @now, @now, NULL, 1, 9201),
       (23, @now, @now, NULL, 1, 9202),
       (24, @now, @now, NULL, 1, 9203),
       (25, @now, @now, NULL, 1, 9204),
       (26, @now, @now, NULL, 1, 9205),
       (27, @now, @now, NULL, 1, 9300),
       (28, @now, @now, NULL, 1, 9301),
       (29, @now, @now, NULL, 1, 9302),
       (30, @now, @now, NULL, 1, 9303),
       (31, @now, @now, NULL, 1, 9304),
       (32, @now, @now, NULL, 1, 9305),
       (33, @now, @now, NULL, 1, 9306);

INSERT INTO magi_group_role (id, created_at, updated_at, deleted_at, group_id, role_id)
VALUES (1, @now, @now, NULL, 1, 1);

INSERT INTO magi_group (id, created_at, updated_at, deleted_at, name)
VALUES (1, @now, @now, NULL, 'Admin Group');

INSERT INTO magi_role (id, created_at, updated_at, deleted_at, name)
VALUES (1, @now, @now, NULL, 'Admin');

INSERT INTO magi_user_group (id, created_at, updated_at, deleted_at, user_id, group_id)
VALUES (1, @now, @now, NULL, 1, 1);

INSERT INTO magi_user_role (id, created_at, updated_at, deleted_at, user_id, role_id)
VALUES (1, @now, @now, NULL, 1, 1);

INSERT INTO magi_user (id, created_at, updated_at, deleted_at, username, password, full_name, email, status)
VALUES (1, @now, @now, NULL, 'admin', '$2a$10$JUSPUULMMK4kOq.vchHmIemTPRZ5NEKgcntEOwG/hMt5IoyV6L89.', 'Admin', 'admin@magi.system', 1);

INSERT INTO magi_label (id, created_at, updated_at, deleted_at, name, code)
VALUES (1, @now, @now, NULL, 'Dev', 'dev'),
       (2, @now, @now, NULL, 'Test', 'test'),
       (3, @now, @now, NULL, 'Stage', 'stage'),
       (4, @now, @now, NULL, 'Production', 'production');

INSERT INTO magi_template (id, created_at, updated_at, deleted_at, name, creator_id, updater_id)
VALUES (1, @now, @now, NULL, 'Default Template', 1, 1);

INSERT INTO magi_template_manifest (id, created_at, updated_at, deleted_at, template_id, filename, content)
VALUES (1, @now, @now, NULL, 1, 'deployment.yaml', '---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Magi.ProjectName }}
spec:
  template:
    spec:
      containers:
        - name: {{ .Magi.ProjectName }}
          image: {{ .Magi.ProjectName }}'),
       (2, @now, @now, NULL, 1, 'service.yaml', '---
apiVersion: v1
kind: Service
metadata:
  name: {{ .Magi.ProjectName }}
spec:
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080');