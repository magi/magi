-- Description: Create table casbin_rule
CREATE TABLE IF NOT EXISTS casbin_rule
(
    id    int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ptype varchar(100) NULL,
    v0    varchar(100) NULL,
    v1    varchar(100) NULL,
    v2    varchar(100) NULL,
    v3    varchar(100) NULL,
    v4    varchar(100) NULL,
    v5    varchar(100) NULL,

    CONSTRAINT idx_casbin_rule UNIQUE (ptype, v0, v1, v2, v3, v4, v5)
);

-- Description: Create table magi_app
CREATE TABLE IF NOT EXISTS magi_app
(
    id             int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at     datetime     NULL,
    updated_at     datetime     NULL,
    deleted_at     datetime     NULL,
    code           varchar(255) NOT NULL,
    project_code   varchar(255) NOT NULL,
    label_code     varchar(255) NOT NULL,
    env_type       varchar(255) NOT NULL,
    env_code       varchar(255) NULL,
    env_set_code   varchar(255) NULL,
    description    varchar(255) NULL,
    image_registry varchar(255) NOT NULL,
    image_name     varchar(255) NOT NULL,
    var_set_code   varchar(255) NOT NULL,
    name           varchar(255) NOT NULL,
    commit         varchar(255) NOT NULL,
    link_config    int UNSIGNED NOT NULL,
    config_code    varchar(255) NULL,
    use_patch      int UNSIGNED NOT NULL,
    patch_content  text         NULL,
    namespace      varchar(255) NULL,
    target_type    varchar(255) NOT NULL,
    status         int UNSIGNED NOT NULL,
    image_tag      varchar(255) NULL,
    config_version varchar(255) NULL,
    deploy_version varchar(255) NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_app_deleted_at ON magi_app (deleted_at);

-- Description: Create table magi_auth_log
CREATE TABLE IF NOT EXISTS magi_auth_log
(
    id          int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  datetime               NULL,
    updated_at  datetime               NULL,
    deleted_at  datetime               NULL,
    username    varchar(255)           NULL,
    client_ip   varchar(255)           NULL,
    auth_status int UNSIGNED DEFAULT 0 NULL
);

CREATE INDEX idx_magi_auth_log_deleted_at ON magi_auth_log (deleted_at);

-- Description: Create table magi_cluster
CREATE TABLE IF NOT EXISTS magi_cluster
(
    id          int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  datetime     NULL,
    updated_at  datetime     NULL,
    deleted_at  datetime     NULL,
    name        varchar(255) NOT NULL,
    code        varchar(255) NOT NULL,
    k8s_version varchar(255) NOT NULL,
    kube_config text         NOT NULL,
    status      int UNSIGNED NULL,
    common      varchar(255) NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_cluster_deleted_at ON magi_cluster (deleted_at);

-- Description: Create table magi_config
CREATE TABLE IF NOT EXISTS magi_config
(
    id              int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at      datetime     NULL,
    updated_at      datetime     NULL,
    deleted_at      datetime     NULL,
    name            varchar(255) NOT NULL,
    code            varchar(255) NOT NULL,
    project_code    varchar(255) NOT NULL,
    label_code      varchar(255) NOT NULL,
    description     varchar(255) NULL,
    linked          int UNSIGNED NOT NULL,
    linked_app_code varchar(255) NULL,
    current_version varchar(255) NULL,
    commit          varchar(255) NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_config_deleted_at ON magi_config (deleted_at);

-- Description: Create table magi_config_file
CREATE TABLE IF NOT EXISTS magi_config_file
(
    id              int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at      datetime     NULL,
    updated_at      datetime     NULL,
    deleted_at      datetime     NULL,
    history_version varchar(255) NOT NULL,
    filename        varchar(255) NOT NULL,
    content         text         NULL
);

CREATE INDEX idx_magi_config_file_deleted_at ON magi_config_file (deleted_at);

-- Description: Create table magi_config_history
CREATE TABLE IF NOT EXISTS magi_config_history
(
    id          int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  datetime     NULL,
    updated_at  datetime     NULL,
    deleted_at  datetime     NULL,
    config_code varchar(255) NOT NULL,
    version     varchar(255) NOT NULL,
    creator_id  int UNSIGNED NOT NULL,
    status      int UNSIGNED NOT NULL,
    commit      varchar(255) NULL
);

CREATE INDEX idx_magi_config_history_deleted_at ON magi_config_history (deleted_at);

-- Description: Create table magi_deploy
CREATE TABLE IF NOT EXISTS magi_deploy
(
    id             int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at     datetime     NULL,
    updated_at     datetime     NULL,
    deleted_at     datetime     NULL,
    version        varchar(255) NOT NULL,
    app_name       varchar(255) NOT NULL,
    app_code       varchar(255) NOT NULL,
    image_tag      varchar(255) NOT NULL,
    config_version varchar(255) NULL,
    patch_content  text         NULL,
    status         int UNSIGNED NOT NULL,
    deployer_id    int UNSIGNED NULL,
    creator_id     int UNSIGNED NOT NULL,
    commit         varchar(255) NULL,
    finished_at    datetime     NULL,
    deploy_version varchar(255) NULL,

    CONSTRAINT version UNIQUE (version)
);

CREATE INDEX idx_magi_deploy_deleted_at ON magi_deploy (deleted_at);

-- Description: Create table magi_env
CREATE TABLE IF NOT EXISTS magi_env
(
    id           int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at   datetime     NULL,
    updated_at   datetime     NULL,
    deleted_at   datetime     NULL,
    name         varchar(255) NOT NULL,
    code         varchar(255) NOT NULL,
    type         varchar(255) NOT NULL,
    cluster_code varchar(255) NOT NULL,
    namespace    varchar(255) NULL,
    label_code   varchar(255) NOT NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_env_deleted_at ON magi_env (deleted_at);

-- Description: Create table magi_env_set
CREATE TABLE IF NOT EXISTS magi_env_set
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    name       varchar(255) NOT NULL,
    code       varchar(255) NOT NULL,
    label_code varchar(255) NOT NULL,
    type       varchar(255) NOT NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_env_set_deleted_at ON magi_env_set (deleted_at);

-- Description: Create table magi_env_set_env
CREATE TABLE IF NOT EXISTS magi_env_set_env
(
    id           int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at   datetime     NULL,
    updated_at   datetime     NULL,
    deleted_at   datetime     NULL,
    env_code     varchar(255) NOT NULL,
    env_set_code varchar(255) NOT NULL
);

CREATE INDEX idx_magi_env_set_env_deleted_at ON magi_env_set_env (deleted_at);

-- Description: Create table magi_group
CREATE TABLE IF NOT EXISTS magi_group
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    name       varchar(255) NOT NULL
);

CREATE INDEX idx_magi_group_deleted_at ON magi_group (deleted_at);

-- Description: Create table magi_group_role
CREATE TABLE IF NOT EXISTS magi_group_role
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    group_id   int UNSIGNED NOT NULL,
    role_id    int UNSIGNED NOT NULL
);

CREATE INDEX idx_magi_group_role_deleted_at ON magi_group_role (deleted_at);

-- Description: Create table magi_label
CREATE TABLE IF NOT EXISTS magi_label
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    name       varchar(255) NOT NULL,
    code       varchar(255) NOT NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_label_deleted_at ON magi_label (deleted_at);

-- Description: Create table magi_menu
CREATE TABLE IF NOT EXISTS magi_menu
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime                    NULL,
    updated_at datetime                    NULL,
    deleted_at datetime                    NULL,
    locale     varchar(255)                NOT NULL,
    path       varchar(255)                NOT NULL,
    method     varchar(255)                NOT NULL,
    type       int UNSIGNED                NOT NULL,
    icon       varchar(255)                NOT NULL,
    parent_id  int UNSIGNED                NOT NULL,
    order_id   int UNSIGNED DEFAULT 999999 NOT NULL,

    CONSTRAINT menu UNIQUE (locale, path, method)
);

CREATE INDEX idx_magi_menu_deleted_at ON magi_menu (deleted_at);

-- Description: Create table magi_opt_log
CREATE TABLE IF NOT EXISTS magi_opt_log
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    user_id    int UNSIGNED NULL,
    url        varchar(255) NULL,
    method     varchar(255) NULL,
    body       text         NULL,
    client_ip  varchar(255) NULL
);

CREATE INDEX idx_magi_opt_log_deleted_at ON magi_opt_log (deleted_at);

-- Description: Create table magi_project
CREATE TABLE IF NOT EXISTS magi_project
(
    id          int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  datetime     NULL,
    updated_at  datetime     NULL,
    deleted_at  datetime     NULL,
    name        varchar(255) NOT NULL,
    code        varchar(255) NOT NULL,
    template_id int UNSIGNED NULL,
    commit      varchar(255) NOT NULL,
    description varchar(255) NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_project_deleted_at ON magi_project (deleted_at);

-- Description: Create table magi_role
CREATE TABLE IF NOT EXISTS magi_role
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    name       varchar(255) NOT NULL
);

CREATE INDEX idx_magi_role_deleted_at ON magi_role (deleted_at);

-- Description: Create table magi_role_menu
CREATE TABLE IF NOT EXISTS magi_role_menu
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    role_id    int UNSIGNED NOT NULL,
    menu_id    int UNSIGNED NOT NULL
);

CREATE INDEX idx_magi_role_menu_deleted_at ON magi_role_menu (deleted_at);

-- Description: Create table magi_template
CREATE TABLE IF NOT EXISTS magi_template
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    name       varchar(255) NOT NULL,
    creator_id int UNSIGNED NOT NULL,
    updater_id int UNSIGNED NULL
);

CREATE INDEX idx_magi_template_deleted_at ON magi_template (deleted_at);

-- Description: Create table magi_template_manifest
CREATE TABLE IF NOT EXISTS magi_template_manifest
(
    id          int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  datetime     NULL,
    updated_at  datetime     NULL,
    deleted_at  datetime     NULL,
    template_id int UNSIGNED NOT NULL,
    filename    varchar(255) NOT NULL,
    content     text         NULL
);

CREATE INDEX idx_magi_template_manifest_deleted_at ON magi_template_manifest (deleted_at);

-- Description: Create table magi_user
CREATE TABLE IF NOT EXISTS magi_user
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    username   varchar(255) NOT NULL,
    password   varchar(255) NOT NULL,
    full_name  varchar(255) NOT NULL,
    email      varchar(255) NULL,
    status     int UNSIGNED NULL
);

CREATE INDEX idx_magi_user_deleted_at ON magi_user (deleted_at);

-- Description: Create table magi_user_group
CREATE TABLE IF NOT EXISTS magi_user_group
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    user_id    int UNSIGNED NOT NULL,
    group_id   int UNSIGNED NOT NULL
);

CREATE INDEX idx_magi_user_group_deleted_at ON magi_user_group (deleted_at);

-- Description: Create table magi_user_role
CREATE TABLE IF NOT EXISTS magi_user_role
(
    id         int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at datetime     NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    user_id    int UNSIGNED NOT NULL,
    role_id    int UNSIGNED NOT NULL
);

CREATE INDEX idx_magi_user_role_deleted_at ON magi_user_role (deleted_at);

-- Description: Create table magi_var
CREATE TABLE IF NOT EXISTS magi_var
(
    id           int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at   datetime     NULL,
    updated_at   datetime     NULL,
    deleted_at   datetime     NULL,
    var_set_code varchar(255) NOT NULL,
    v_key        varchar(255) NOT NULL,
    v_value      varchar(255) NOT NULL,
    commit       varchar(255) NULL,
    editor_id    int UNSIGNED NOT NULL
);

CREATE INDEX idx_magi_var_deleted_at ON magi_var (deleted_at);

-- Description: Create table magi_var_set
CREATE TABLE IF NOT EXISTS magi_var_set
(
    id          int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  datetime     NULL,
    updated_at  datetime     NULL,
    deleted_at  datetime     NULL,
    name        varchar(255) NOT NULL,
    code        varchar(255) NOT NULL,
    description varchar(255) NULL,
    label_code  varchar(255) NOT NULL,
    commit      varchar(255) NULL,
    editor_id   int UNSIGNED NOT NULL,

    CONSTRAINT code UNIQUE (code)
);

CREATE INDEX idx_magi_var_set_deleted_at ON magi_var_set (deleted_at);
