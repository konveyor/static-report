import React from "react";
import { NavLink } from "react-router-dom";

import { Nav, NavItem, NavList, PageSidebar } from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";

import { useSimpleContext } from "@app/context/simple-context";

export const SidebarApp: React.FC = () => {
  const { currentContext } = useSimpleContext();

  const renderPageNav = () => {
    return (
      <Nav id="nav-sidebar" aria-label="Nav">
        <NavList>
          <NavItem
            component={({ className, children }) => (
              <NavLink
                to="/applications"
                className={({ isActive }) =>
                  css(className, isActive ? "pf-m-current" : "")
                }
              >
                {children}
              </NavLink>
            )}
          >
            Applications
          </NavItem>
        </NavList>
        <NavList>
          <NavItem
            component={({ className, children }) => (
              <NavLink
                to={
                  !currentContext
                    ? "/issues/applications"
                    : "/issues/applications/" + currentContext.key
                }
                className={({ isActive }) =>
                  css(className, isActive ? "pf-m-current" : "")
                }
              >
                {children}
              </NavLink>
            )}
          >
            Issues
          </NavItem>
        </NavList>
        <NavList>
          <NavItem
            component={({ className, children }) => (
              <NavLink
                to={
                  !currentContext
                    ? "/insights/applications"
                    : "/insights/applications/" + currentContext.key
                }
                className={({ isActive }) =>
                  css(className, isActive ? "pf-m-current" : "")
                }
              >
                {children}
              </NavLink>
            )}
          >
            Insights
          </NavItem>
        </NavList>
        <NavList>
          <NavItem
            component={({ className, children }) => (
              <NavLink
                to={
                  !currentContext
                    ? "/dependencies/applications"
                    : "/dependencies/applications/" + currentContext.key
                }
                className={({ isActive }) =>
                  css(className, isActive ? "pf-m-current" : "")
                }
              >
                {children}
              </NavLink>
            )}
          >
            Dependencies
          </NavItem>
        </NavList>
      </Nav>
    );
  };

  return <PageSidebar>{renderPageNav()}</PageSidebar>;
};
