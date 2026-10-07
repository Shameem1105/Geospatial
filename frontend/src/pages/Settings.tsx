import React, { useState } from 'react';
import { Icon, type IconName } from '../components/Icons';
import { Button } from '../components/Button';

export const Settings: React.FC = () => {
  const [tab, setTab] = useState('API');
  const [apiAccessEnabled, setApiAccessEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const tabs: { label: string; icon: IconName }[] = [
    { label: 'Workspace', icon: 'folder' },
    { label: 'Processing', icon: 'layers' },
    { label: 'Storage', icon: 'cloud' },
    { label: 'API', icon: 'code' },
    { label: 'Users', icon: 'grid' },
    { label: 'Security', icon: 'shield' },
  ];

  const systemStatus = [
    ['REST API', 'Operational', '42 ms'],
    ['Processing workers', 'Operational', '8 active'],
    ['PostGIS database', 'Operational', '18 ms'],
    ['Object storage', 'Operational', '99.99%'],
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page settings-page">
      <div className="eyebrow">SYSTEM CONFIGURATION</div>
      <div className="page-title">Settings</div>
      <p className="page-subtitle">
        Manage workspace preferences, processing defaults, and integrations.
      </p>

      <div className="settings-layout">
        <div className="settings-nav">
          {tabs.map((t) => (
            <button
              className={tab === t.label ? 'active' : ''}
              onClick={() => setTab(t.label)}
              key={t.label}
            >
              <Icon name={t.icon} />
              {t.label}
              <Icon name="arrow" />
            </button>
          ))}
        </div>

        <div className="settings-content">
          <div className="panel api-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">{tab} configuration</div>
                <p>Connect external systems to TerraFlow processing services.</p>
              </div>
              <span className="system-ok">
                <i /> Operational
              </span>
            </div>

            <div className="setting-section">
              <label>Production API endpoint</label>
              <div className="copy-field">
                <code>https://api.terraflow.io/v1</code>
                <button onClick={() => copyToClipboard('https://api.terraflow.io/v1')}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-title">
                <div>
                  <strong>API access</strong>
                  <span>Allow programmatic uploads and result retrieval.</span>
                </div>
                <button
                  className={`toggle ${apiAccessEnabled ? 'on' : ''}`}
                  onClick={() => setApiAccessEnabled(!apiAccessEnabled)}
                  aria-label="Toggle API access"
                >
                  <span />
                </button>
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-title">
                <div>
                  <strong>API keys</strong>
                  <span>Keys are only shown once at creation.</span>
                </div>
                <Button
                  variant="secondary"
                  icon="plus"
                  onClick={() => alert('Generated new API key: tf_live_' + Math.random().toString(36).substring(2, 10))}
                >
                  Create key
                </Button>
              </div>
              <div className="key-row">
                <div className="key-icon">
                  <Icon name="code" />
                </div>
                <div>
                  <strong>Production Processing</strong>
                  <code>tf_live_••••••••••••a8f2</code>
                </div>
                <span>Last used 4 min ago</span>
                <Icon name="more" />
              </div>
            </div>
          </div>

          <div className="panel system-panel">
            <div className="panel-title">System status</div>
            {systemStatus.map((r) => (
              <div className="system-row" key={r[0]}>
                <span className="pulse" />
                <strong>{r[0]}</strong>
                <span>{r[1]}</span>
                <code>{r[2]}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
