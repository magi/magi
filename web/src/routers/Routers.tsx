import React, { FC } from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { loggedIn } from "../utils/auth";
import BaseLayout from "../layouts/BaseLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import NoFoundPage from "../pages/404";
import Login from "../pages/login/Login";
import User from "../pages/settings/user/User";
import Group from "../pages/settings/group/Group";
import Role from "../pages/settings/role/Role";
import Cluster from "../pages/ops/cluster/Cluster";
import Env from "../pages/ops/env/Env";
import EnvSet from "../pages/ops/envset/EnvSet";
import Project from "../pages/project/project/Project";
import Template from "../pages/ops/template/Template";
import VarSet from "../pages/deploy/varset/VarSet";
import VarSetInfo from "../pages/deploy/varset/VarSetInfo";
import ConfigInfo from "../pages/deploy/config/ConfigInfo";
import Config from "../pages/deploy/config/Config";
import App from "../pages/deploy/app/App";
import Label from "../pages/ops/label/Label";
import AppInfo from "../pages/deploy/app/AppInfo";

const Routers: FC = () =>
    <Router>
        <Switch>
            <Route exact path='/'>{loggedIn() ? <Redirect to='/dashboard' /> : <Login />}</Route>
            <Route exact path={"/login"} component={Login} />
            <Route path='/' children={() =>
                <BaseLayout>
                    <Switch>
                        <Route path={"/dashboard"} component={Dashboard} />
                        <Route path={"/settings/users"} component={User} />
                        <Route path={"/settings/groups"} component={Group} />
                        <Route path={"/settings/roles"} component={Role} />
                        <Route path={"/clusters"} component={Cluster} />
                        <Route path={"/envs"} component={Env} />
                        <Route path={"/env_sets"} component={EnvSet} />
                        <Route path={"/projects"} component={Project} />
                        <Route path={"/templates"} component={Template} />
                        <Route path={"/labels"} component={Label} />
                        <Route path={"/var_sets/:code"} component={VarSetInfo} />
                        <Route path={"/var_sets"} component={VarSet} />
                        <Route path={"/configs/:code"} component={ConfigInfo} />
                        <Route path={"/configs"} component={Config} />
                        <Route path={"/apps/:code"} component={AppInfo} />
                        <Route path={"/apps"} component={App} />
                        <Route component={NoFoundPage} />
                    </Switch>
                </BaseLayout>
            } />
        </Switch>
    </Router>;
export default Routers;
