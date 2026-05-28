/**
 * 飞象老师校园版 · 统一侧边栏注入器
 *
 * 用法：
 *   1. 在页面 <head> 引入：
 *      <link rel="stylesheet" href="assets/feixiang-shell.css">
 *   2. 在 <body> 里放置容器：
 *      <aside id="feixiang-sidebar"></aside>
 *   3. 引入并调用：
 *      <script src="assets/feixiang-shell.js"></script>
 *      <script>renderFeixiangSidebar('my-wiki');</script>
 *
 *   activeKey 取值（决定哪个菜单项高亮）：
 *     'home' | 'chat-history' | 'my-wiki' | 'school-wiki'
 *     | 'apps' | 'resources' | 'class'
 */

(function () {
  const ICONS = {
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    history: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    person: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><circle cx="12" cy="7" r="4"/></svg>',
    school: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    apps: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
    resources: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>',
    classes: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    bell: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    sparkle: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>',
    chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  };

  function navItem({ key, icon, label, href, count, dot, primary, activeKey }) {
    const isActive = key === activeKey;
    const cls = ['fx-nav-btn', primary && 'primary', isActive && 'active']
      .filter(Boolean).join(' ');
    const right = (count || dot)
      ? `<div class="fx-nav-right">${dot ? '<span class="fx-nav-dot"></span>' : ''}${count ? `<span class="fx-nav-count">${count}</span>` : ''}</div>`
      : '';
    return `<a class="${cls}" href="${href}">${icon}${label}${right}</a>`;
  }

  window.renderFeixiangSidebar = function (activeKey) {
    const container = document.getElementById('feixiang-sidebar');
    if (!container) return;

    container.classList.add('fx-sidebar');
    container.innerHTML = `
      <a class="fx-workspace" href="index.html" title="返回首页">
        <div class="fx-ws-main">
          <div class="fx-school-logo">实</div>
          <div class="fx-school-name">北京市实验中学</div>
          <svg class="fx-ws-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div class="fx-ws-footer">
          <div class="fx-power-by">
            ${ICONS.sparkle}
            飞象老师校园版
          </div>
        </div>
      </a>

      ${navItem({ key: 'home', icon: ICONS.plus, label: '新对话', href: 'index.html', primary: true, activeKey })}
      ${navItem({ key: 'chat-history', icon: ICONS.history, label: '历史对话', href: 'chat-history.html', count: 86, activeKey })}

      <div class="fx-nav-title">知识库</div>
      ${navItem({ key: 'my-wiki', icon: ICONS.person, label: '我的知识库', href: 'my-wiki.html', count: 12, activeKey })}
      ${navItem({ key: 'school-wiki', icon: ICONS.school, label: '学校知识库', href: 'school-wiki.html', count: 348, dot: true, activeKey })}

      <div class="fx-nav-title">常用</div>
      ${navItem({ key: 'apps', icon: ICONS.apps, label: '应用广场', href: '#', activeKey })}
      ${navItem({ key: 'resources', icon: ICONS.resources, label: '资源广场', href: 'resource-square.html', activeKey })}
      ${navItem({ key: 'class', icon: ICONS.classes, label: '我的班级', href: '#', activeKey })}

      <div class="fx-spacer"></div>

      ${navItem({ key: 'notifications', icon: ICONS.bell, label: '通知', href: '#', count: 3, dot: true, activeKey })}

      <div class="fx-user">
        <div class="fx-avatar">张</div>
        <div>
          <div class="fx-user-name">张老师</div>
          <div class="fx-user-role">高一语文 · 实验中学</div>
        </div>
      </div>
    `;
  };
})();
