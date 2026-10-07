import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './Icons';
import { Logo } from './Logo';

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Overview', icon: 'grid' },
  { path: '/projects', label: 'Projects', icon: 'folder' },
  { path: '/files', label: 'Survey Files', icon: 'file' },
  { path: '/explorer', label: 'Measurements', icon: 'ruler' },
  { path: '/analytics', label: 'Analytics', icon: 'chart' },
  { path: '/reports', label: 'Reports', icon: 'report' },
];

export const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <Logo />
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {isActive && <span className="active-dot" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={`nav-item ${location.pathname.startsWith('/settings') ? 'active' : ''}`}
        >
          <Icon name="settings" />
          <span>Settings</span>
          {location.pathname.startsWith('/settings') && <span className="active-dot" />}
        </NavLink>

        <div className="api-status">
          <span className="pulse" />
          <div>
            <strong>API operational</strong>
            <small>All systems normal</small>
          </div>
        </div>

        <div className="profile-card">
          <div className="avatar">AK</div>
          <div>
            <strong>Arjun Kumar</strong>
            <small>Lead Survey Engineer</small>
          </div>
          <Icon name="more" />
        </div>
      </div>
    </aside>
  );
};
