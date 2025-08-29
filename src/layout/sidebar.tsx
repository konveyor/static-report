import React from "react";
import { NavLink } from "react-router-dom";

import { Nav, NavList, PageSidebar } from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";

import { useSimpleContext } from "@app/context/simple-context";

import { LayoutTheme } from "./layout-constants";

export const SidebarApp: React.FC = () => {
  const { currentContext } = useSimpleContext();

  const renderPageNav = () => {
    return (
      <Nav id="nav-sidebar" aria-label="Nav" theme={LayoutTheme}>
        <NavList>
          <NavLink
            to="/applications"
            className={({ isActive }) =>
              css("pf-v5-c-nav__link", isActive ? "pf-m-current" : "")
            }
          >
            Applications
          </NavLink>
        </NavList>
        <NavList>
          <NavLink
            to={
              !currentContext
                ? "/issues/applications"
                : "/issues/applications/" + currentContext.key
            }
            className={({ isActive }) =>
              css("pf-v5-c-nav__link", isActive ? "pf-m-current" : "")
            }
          >
            Issues
          </NavLink>
        </NavList>
        <NavList>
          <NavLink
            to={
              !currentContext
                ? "/insights/applications"
                : "/insights/applications/" + currentContext.key
            }
            className={({ isActive }) =>
              css("pf-v5-c-nav__link", isActive ? "pf-m-current" : "")
            }
          >
            Insights
          </NavLink>
        </NavList>
        <NavList>
          <NavLink
            to={
              !currentContext
                ? "/dependencies/applications"
                : "/dependencies/applications/" + currentContext.key
            }
            className={({ isActive }) =>
              css("pf-v5-c-nav__link", isActive ? "pf-m-current" : "")
            }
          >
            Dependencies
          </NavLink>
        </NavList>
      </Nav>
    );
  };

  return <PageSidebar theme={LayoutTheme}>{renderPageNav()}</PageSidebar>;
};
