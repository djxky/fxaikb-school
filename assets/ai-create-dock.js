/* ============================================================
   ai-create-dock.js · 飞象老师校园版「AI 创造入口」浮动 dock
   --------------------------------------------------------------
   职责：
   - placeholder 自动轮播（用户没聚焦/没输入时）
   - textarea 自动展开（最多 120px）
   - 发送：Enter 提交 / Shift+Enter 换行 / 点击发送按钮
   - 提交后：演示 Toast + 清空输入

   配置（dock 元素上的 data-* 属性）：
   - data-kind="资源" / "应用" 等：决定 toast 文案的"生成 XX"
   - data-placeholders="A|B|C"：竖线分隔的轮播示例，至少 1 条
   ============================================================ */
(function () {
  'use strict';

  var ROTATE_INTERVAL = 3500;

  function init() {
    var docks = document.querySelectorAll('.ai-dock');
    docks.forEach(setup);
  }

  function setup(dock) {
    var input = dock.querySelector('.ai-dock-input');
    var sendBtn = dock.querySelector('.ai-dock-send');
    if (!input || !sendBtn) return;

    var raw = dock.getAttribute('data-placeholders') || '';
    var placeholders = raw.split('|').map(function (s) { return s.trim(); }).filter(Boolean);

    if (placeholders.length > 0) {
      input.placeholder = placeholders[0];
    }

    if (placeholders.length > 1) {
      var i = 0;
      setInterval(function () {
        if (document.activeElement === input || input.value) return;
        input.classList.add('is-fading');
        setTimeout(function () {
          i = (i + 1) % placeholders.length;
          input.placeholder = placeholders[i];
          input.classList.remove('is-fading');
        }, 260);
      }, ROTATE_INTERVAL);
    }

    sendBtn.addEventListener('click', function () { submit(dock, input); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        submit(dock, input);
      }
    });

    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }

  function submit(dock, input) {
    var text = (input.value || '').trim();
    if (!text) {
      input.focus();
      return;
    }
    var kind = dock.getAttribute('data-kind') || '内容';
    var preview = text.length > 24 ? text.slice(0, 24) + '…' : text;
    showToast('已收到「' + preview + '」· AI 正在为你生成' + kind);

    input.value = '';
    input.style.height = '';
  }

  function showToast(msg) {
    var t = document.getElementById('ai-dock-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ai-dock-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    // 强制重排让 transition 生效
    void t.offsetWidth;
    t.classList.add('show');
    if (t._timer) clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 3600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
