import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import Logo from "/images/logo/aydevelopers.png";
import LogoIcon from "/images/logo/aydev-icon.png";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { handleLogout } from "../utilities/auth";

// Update the NavItem type to support nested sub-items
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    icon?: React.ReactNode;
    subItems?: {
      name: string;
      path: string;
      pro?: boolean;
      new?: boolean;
      icon?: React.ReactNode;
    }[];
  }[];
};

// Alternative using existing icons
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <ListIcon />,
    name: "Main Menu",
    subItems: [
      {
        name: "Users",
        path: "/add-users",
        icon: <UserCircleIcon />,
        subItems: [
          { name: "Create User", path: "/add-users", icon: <UserCircleIcon /> },
          {
            name: "S/G Managers",
            path: "/sg-managers",
            icon: <UserCircleIcon />,
          },
          {
            name: "Ambassadors",
            path: "/ambassadors",
            icon: <UserCircleIcon />,
          },
          {
            name: "Customers",
            path: "/customers",
            icon: <UserCircleIcon />,
          },
        ],
      },
      { name: "Tickets", path: "/tickets", icon: <ListIcon /> },
      { name: "Products", path: "/products", icon: <GridIcon /> },

      { name: "Promotions", path: "/promotions", icon: <PlugInIcon /> },
      {
        name: "Withdrawals",
        path: "/withdrawals",
        icon: <HorizontaLDots />,
      },
      { name: "Reports", path: "/reports", icon: <ChevronDownIcon /> },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Profile",
    subItems: [
      { name: "Admin Profile", path: "/profile", icon: <UserCircleIcon /> },
      { name: "Settings", path: "/settings", icon: <PlugInIcon /> },
    ],
  },
];

// Replace the sign out nav item in othersItems array
const othersItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Sign Out",
    onClick: handleLogout, // Add onClick handler
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
    subIndex?: number;
  } | null>(null);

  const [openNestedSubmenu, setOpenNestedSubmenu] = useState<{
    type: "main" | "others";
    index: number;
    subIndex: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const [nestedSubMenuHeight, setNestedSubMenuHeight] = useState<
    Record<string, number>
  >({}); // Add nested height state

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nestedSubMenuRefs = useRef<Record<string, HTMLDivElement | null>>({}); // Add nested refs

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Update the nested submenu height calculation
  useEffect(() => {
    if (openNestedSubmenu !== null) {
      const key = `${openNestedSubmenu.type}-${openNestedSubmenu.index}-${openNestedSubmenu.subIndex}`;
      if (nestedSubMenuRefs.current[key]) {
        setNestedSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: nestedSubMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openNestedSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Add the nested submenu toggle handler
  const handleNestedSubmenuToggle = (
    index: number,
    subIndex: number,
    menuType: "main" | "others"
  ) => {
    setOpenNestedSubmenu((prevOpenNestedSubmenu) => {
      if (
        prevOpenNestedSubmenu &&
        prevOpenNestedSubmenu.type === menuType &&
        prevOpenNestedSubmenu.index === index &&
        prevOpenNestedSubmenu.subIndex === subIndex
      ) {
        return null;
      }
      return { type: menuType, index, subIndex };
    });
  };

  // Update the renderMenuItems function to handle nested sub-items with transitions
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.onClick ? (
            <button
              onClick={nav.onClick}
              className="menu-item group menu-item-inactive"
            >
              <span className="menu-item-icon-size menu-item-icon-inactive">
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </button>
          ) : nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem, subIndex) => (
                  <li key={subItem.name}>
                    {subItem.subItems ? (
                      // Render nested submenu item with transitions
                      <div>
                        <button
                          onClick={() =>
                            handleNestedSubmenuToggle(index, subIndex, menuType)
                          }
                          className={`menu-dropdown-item ${
                            openNestedSubmenu?.type === menuType &&
                            openNestedSubmenu?.index === index &&
                            openNestedSubmenu?.subIndex === subIndex
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          } w-full justify-between`}
                        >
                          <span className="flex items-center gap-2">
                            {subItem.icon && (
                              <span className="w-4 h-4 flex-shrink-0">
                                {subItem.icon}
                              </span>
                            )}
                            {subItem.name}
                          </span>
                          <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-200 ${
                              openNestedSubmenu?.type === menuType &&
                              openNestedSubmenu?.index === index &&
                              openNestedSubmenu?.subIndex === subIndex
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                        {/* Nested sub-items with smooth transition */}
                        <div
                          ref={(el) => {
                            nestedSubMenuRefs.current[
                              `${menuType}-${index}-${subIndex}`
                            ] = el;
                          }}
                          className="overflow-hidden transition-all duration-300"
                          style={{
                            height:
                              openNestedSubmenu?.type === menuType &&
                              openNestedSubmenu?.index === index &&
                              openNestedSubmenu?.subIndex === subIndex
                                ? `${
                                    nestedSubMenuHeight[
                                      `${menuType}-${index}-${subIndex}`
                                    ]
                                  }px`
                                : "0px",
                          }}
                        >
                          <ul className="mt-1 ml-4 space-y-1">
                            {subItem.subItems.map((nestedItem) => (
                              <li key={nestedItem.name}>
                                <Link
                                  to={nestedItem.path}
                                  className={`menu-dropdown-item text-sm ${
                                    isActive(nestedItem.path)
                                      ? "menu-dropdown-item-active"
                                      : "menu-dropdown-item-inactive"
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    {nestedItem.icon && (
                                      <span className="w-3 h-3 flex-shrink-0">
                                        {nestedItem.icon}
                                      </span>
                                    )}
                                    {nestedItem.name}
                                  </span>
                                  <span className="flex items-center gap-1 ml-auto">
                                    {nestedItem.new && (
                                      <span className="menu-dropdown-badge menu-dropdown-badge-inactive">
                                        new
                                      </span>
                                    )}
                                    {nestedItem.pro && (
                                      <span className="menu-dropdown-badge menu-dropdown-badge-inactive">
                                        pro
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      // Regular submenu item
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {subItem.icon && (
                            <span className="w-4 h-4 flex-shrink-0">
                              {subItem.icon}
                            </span>
                          )}
                          {subItem.name}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4 md:py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src={Logo}
              className="dark:invert"
              alt="Logo"
              width={160}
              height={32}
            />
          ) : (
            <img
              src={LogoIcon}
              className="dark:invert"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
