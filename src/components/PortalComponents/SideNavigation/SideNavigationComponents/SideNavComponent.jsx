import { useContext } from "react";
import NavIcon from "./NavIcon";
import NavIconsCard from "./NavIconsCard";
import OuterCard from "./OuterCard";
import LogoutButton from "../Shared/LogoutButton";
import { getNavLinks } from "../navConfig";
import { AuthContext } from "../../../../store/auth-context";

function sectionizeLinks(links) {
  return links.reduce((acc, link) => {
    const section = link.section || "Navigation";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(link);
    return acc;
  }, {});
}

export default function SideNavComponent({ onClick, isExpanded, padding }) {
  const authCtx = useContext(AuthContext);
  const role_id = authCtx.roleId ? String(authCtx.roleId) : "1";
  const navLinks = getNavLinks(role_id);
  const linksBySection = sectionizeLinks(navLinks);

  return (
    <OuterCard padding={padding}>
      <div className="flex flex-col h-full w-full">
        <NavIconsCard padding={padding} width="w-full">
          {Object.entries(linksBySection).map(([section, links]) => (
            <div key={section} className="w-full space-y-2">
              <div className="overflow-hidden">
                <p
                  className={`text-[0.55rem] uppercase tracking-[0.18em] text-gray-400 transition-all duration-300 ${
                    isExpanded
                      ? "max-h-4 opacity-100 translate-y-0 w-[8rem] mx-auto text-left"
                      : "max-h-0 opacity-0 -translate-y-1"
                  }`}
                >
                  {section}
                </p>
              </div>

              <div
                className={`flex flex-col ${
                  isExpanded ? "items-center gap-2" : "items-center gap-2"
                }`}
              >
                {links.map((link) => (
                  <NavIcon
                    key={link.id}
                    icon={link.icon}
                    link={link.path}
                    isExpanded={isExpanded}
                  >
                    {link.label}
                  </NavIcon>
                ))}
              </div>
            </div>
          ))}
        </NavIconsCard>

        <div className="mt-auto self-stretch">
          <div className={isExpanded ? "px-4" : "px-1"}>
            <div className={isExpanded ? "w-[8rem] mx-auto" : "w-10 mx-auto"}>
              <div className="border-t border-gray-200" />
            </div>
          </div>
          <div className={isExpanded ? "px-4 pt-3 pb-0" : "px-1 pt-2 pb-0"}>
            <LogoutButton onClick={onClick} expanded={isExpanded} />
          </div>
        </div>
      </div>
    </OuterCard>
  );
}
