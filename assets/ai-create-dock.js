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
  var AI_CAPABILITIES = [
    { id: 'qbank', label: 'AI 组题', desc: '根据知识点、题型和难度快速生成练习、测验或试卷。', placeholder: 'AI 组题｜帮我生成一份北京朝阳区七年级上册数学期末考试模拟题', svg: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
    { id: 'animation', label: '教学动画', badge: '新功能', desc: '生成用于课堂讲解的专业级互动教学动画。', placeholder: '教学动画｜设计初中数学勾股定理互动教学活动，引导学生主动探究，培养几何直观、逻辑推理能力。', svg: '<path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m5.6 5.6 2.8 2.8"/><path d="m15.6 15.6 2.8 2.8"/><path d="m18.4 5.6-2.8 2.8"/><path d="m8.4 15.6-2.8 2.8"/><circle cx="12" cy="12" r="3"/>' },
    { id: 'game', label: '教学游戏', badge: '新功能', desc: '把知识点设计成可在课堂中使用的小游戏。', placeholder: '教学游戏｜以《西游记》取经之路为故事线，生成六年级课内古诗词闯关游戏，让学生在游戏化体验中变“被动背诵”为“主动探究”。', svg: '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="3"/>' },
    { id: 'interactive', label: '互动课件', badge: '新功能', desc: '上传教案文件后，生成可操作、可演示的课堂互动课件。', placeholder: '互动课件｜帮我生成初英人教七下U1 Grammar Focus的互动课件，通过精简而高效的语言活动，帮助学生掌握并巩固与动物相关的词汇、句型及原因状语从句引导词because的用法。', svg: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>' },
    { id: 'data', label: '数据回收', badge: '新功能', desc: '上传 HTML 文件后，为课件增加答题、统计和课堂数据回收。', placeholder: '数据回收｜我想在课件的练习环节，增加数据回收功能，了解每道题的正确率及高频错题的情况。', svg: '<path d="M3 3v18h18"/><path d="M7 15v2"/><path d="M12 9v8"/><path d="M17 12v5"/>' }
  ];
  var AI_MODE_SVG = '<path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z"/>';
  var KB_CONTENT_ITEMS = {
    school: [
      { id:'sch-folder-lesson', type:'folder', name:'课堂教学', meta:'文件夹 · 12 个文件 · 学校知识库' },
      { id:'sch-doc-quad', type:'file', name:'二次函数·导入课件.pptx', meta:'PPTX · 4.2MB · 5 天前' },
      { id:'sch-audio-pending', type:'audio', name:'圆的切线性质·课堂录音.mp3', meta:'音频 · 审核中', disabled:true, status:'审核中' }
    ],
    mine: [
      { id:'mine-folder-prep', type:'folder', name:'备课资源', meta:'文件夹 · 8 个文件 · 我的知识库' },
      { id:'mine-doc-plan', type:'file', name:'相似三角形判定·公开课设计.docx', meta:'Word · 1.4MB · 昨天' },
      { id:'mine-video-pending', type:'video', name:'课堂实录片段.mp4', meta:'视频 · 审核中', disabled:true, status:'审核中' }
    ]
  };
  var KB_CONTENT_CHILDREN = {
    'sch-folder-lesson': [
      { id:'sch-folder-lesson-doc-1', type:'video', name:'圆的切线性质·教学动画.mp4', meta:'视频 · 34MB · 审核完成' },
      { id:'sch-folder-lesson-doc-2', type:'file', name:'二次函数公开课教案.docx', meta:'Word · 1.8MB · 5 天前' },
      { id:'sch-folder-lesson-doc-3', type:'audio', name:'圆的切线性质·课堂录音.mp3', meta:'音频 · 审核中', disabled:true, status:'审核中' }
    ],
    'mine-folder-prep': [
      { id:'mine-folder-prep-doc-1', type:'file', name:'相似三角形判定·公开课设计.docx', meta:'Word · 1.4MB · 昨天' },
      { id:'mine-folder-prep-doc-2', type:'image', name:'二次函数对称轴·板书图.jpg', meta:'图片 · 2.1MB · 今天' },
      { id:'mine-folder-prep-doc-3', type:'video', name:'课堂实录片段.mp4', meta:'视频 · 审核中', disabled:true, status:'审核中' }
    ]
  };

  function init() {
    var docks = document.querySelectorAll('.ai-dock');
    docks.forEach(setup);
  }

  function setup(dock) {
	    var input = dock.querySelector('.ai-dock-input');
	    var sendBtn = dock.querySelector('.ai-dock-send');
	    if (!input || !sendBtn) return;
    var panelEnabled = dock.getAttribute('data-ai-panel') === 'true';
    var panel = dock.querySelector('.ai-dock-panel');
    var chipList = dock.querySelector('.ai-dock-chip-list') || panel;
    var modeEl = dock.querySelector('.ai-dock-mode');
    var uploadCard = dock.querySelector('.ai-dock-upload-card');
    var activeCapability = null;
    var capabilityUploads = {};
    var genericAttachment = null;
    var kbAttachment = null;
    var kbTab = 'school';
    var kbQuery = '';
    var kbFolder = null;
    var skipCapabilityClick = false;
    var suppressCapabilityForCurrentClick = false;

    var raw = dock.getAttribute('data-placeholders') || '';
    var placeholders = raw.split('|').map(function (s) { return s.trim(); }).filter(Boolean);

    if (placeholders.length > 0) {
      input.placeholder = placeholders[0];
    }

	    if (placeholders.length > 1) {
      var i = 0;
      setInterval(function () {
	        if (document.activeElement === input || input.value || activeCapability) return;
        input.classList.add('is-fading');
        setTimeout(function () {
          i = (i + 1) % placeholders.length;
          input.placeholder = placeholders[i];
          input.classList.remove('is-fading');
        }, 260);
      }, ROTATE_INTERVAL);
	    }

    if (panelEnabled && panel) {
      renderAiCapabilities();
      input.addEventListener('mousedown', function () {
        suppressCapabilityForCurrentClick = true;
      });
      document.addEventListener('click', function () {
        if (!suppressCapabilityForCurrentClick) return;
        setTimeout(function () {
          suppressCapabilityForCurrentClick = false;
        }, 0);
      }, true);
      dock.addEventListener('mousedown', function (event) {
        var btn = event.target.closest('[data-capability]');
        if (!btn || !dock.contains(btn)) return;
        if (suppressCapabilityForCurrentClick) return;
        event.preventDefault();
        event.stopPropagation();
        skipCapabilityClick = true;
        selectCapability(btn.getAttribute('data-capability'));
      });
      dock.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-capability]');
        if (!btn || !dock.contains(btn)) return;
        if (suppressCapabilityForCurrentClick) return;
        event.preventDefault();
        event.stopPropagation();
        if (skipCapabilityClick) {
          skipCapabilityClick = false;
          return;
        }
        selectCapability(btn.getAttribute('data-capability'));
      });
      dock.addEventListener('click', function () {
        dock.classList.add('is-expanded');
      });
      input.addEventListener('focus', function () {
        dock.classList.add('is-expanded');
      });
      document.addEventListener('click', function (event) {
        if (dock.contains(event.target)) return;
        if (!input.value && !activeCapability) {
          dock.classList.remove('is-expanded');
          input.style.height = '';
        }
      });
    }

    dock.querySelectorAll('.ai-dock-attach-btn').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (btn.getAttribute('data-dock-action') === 'plus') {
          openDockPlusMenu(btn);
          return;
        }
        if (btn.getAttribute('data-dock-action') === 'kb') {
          openDockKbPicker('plus');
          return;
        }
        addGenericAttachment();
      });
    });

    if (uploadCard) {
      uploadCard.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var req = getUploadRequirement(activeCapability);
        if (!req) {
          addGenericAttachment();
          return;
        }
        capabilityUploads[req.id] = { name: req.fileName };
        renderUploadCard();
        showToast(req.toast);
      });
    }

	    sendBtn.addEventListener('click', trySubmit);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
	        trySubmit();
	      }
	    });

    input.addEventListener('input', function () {
      input.style.height = 'auto';
	      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      if ((input.value || '').endsWith('@')) openDockKbPicker('at');
	    });

    function renderAiCapabilities() {
      if (!chipList) return;
      if (dock.getAttribute('data-fixed-intent') === 'create-app') {
        chipList.innerHTML = '<button type="button" class="ai-dock-chip active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + AI_MODE_SVG + '</svg>教育应用</button>';
        return;
      }
      chipList.innerHTML = AI_CAPABILITIES.map(function (cap) {
        return '<button type="button" class="ai-dock-chip' + (activeCapability === cap.id ? ' active' : '') + '" data-capability="' + cap.id + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + cap.svg + '</svg>' +
          cap.label +
          (cap.beta ? '<span class="chip-beta">BETA</span>' : '') +
        '</button>';
      }).join('');
    }

    function selectCapability(id) {
      activeCapability = activeCapability === id ? null : id;
      var cap = getCapability(activeCapability);
      input.placeholder = cap ? cap.placeholder : (placeholders[0] || '描述你想要的资源…');
      dock.classList.add('is-expanded');
      renderMode();
      renderUploadCard();
      renderAiCapabilities();
      input.focus();
    }

    function renderMode() {
      var cap = getCapability(activeCapability);
      dock.classList.toggle('has-mode', !!cap);
      if (!modeEl) return;
      if (!cap) {
        modeEl.style.display = 'none';
        modeEl.innerHTML = '';
        return;
      }
      modeEl.style.display = 'inline-flex';
      modeEl.innerHTML = '<svg class="mode-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + AI_MODE_SVG + '</svg>' +
        cap.label +
        '<span class="mode-x" title="取消"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg></span>';
      var clear = modeEl.querySelector('.mode-x');
      if (clear) {
        clear.addEventListener('click', function (event) {
          event.stopPropagation();
          activeCapability = null;
          input.placeholder = placeholders[0] || '描述你想要的资源…';
          renderMode();
          renderUploadCard();
          renderAiCapabilities();
          input.focus();
        });
      }
    }

    function renderUploadCard() {
      var req = getUploadRequirement(activeCapability);
      if (genericAttachment && genericAttachment.status !== '处理完成') {
        sendBtn.disabled = true;
      } else {
        sendBtn.disabled = false;
      }
      dock.classList.toggle('upload-required', !!req || !!genericAttachment || !!kbAttachment);
      if (!uploadCard) return;
      if (!req) {
        var activeAttachment = kbAttachment || genericAttachment;
        uploadCard.classList.toggle('is-uploaded', !!activeAttachment);
        uploadCard.innerHTML = activeAttachment
          ? '<span class="uploaded-label">' + (kbAttachment ? '已引用' : '已上传') + '</span><span class="uploaded-line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span class="uploaded-name">' + activeAttachment.name + (activeAttachment.status ? ' · ' + activeAttachment.status : '') + '</span><span class="upload-remove" title="移除"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></span>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg><span>上传文件</span>';
        var removeGeneric = uploadCard.querySelector('.upload-remove');
        if (removeGeneric) {
          removeGeneric.addEventListener('click', function (event) {
            event.stopPropagation();
            genericAttachment = null;
            kbAttachment = null;
            renderUploadCard();
          });
        }
        return;
      }
      var uploaded = capabilityUploads[req.id];
      uploadCard.classList.toggle('is-uploaded', !!uploaded);
      uploadCard.innerHTML = uploaded
        ? '<span class="uploaded-label">已上传</span><span class="uploaded-line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span class="uploaded-name">' + uploaded.name + '</span><span class="upload-remove" title="移除"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></span>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg><span>' + req.label + '</span>';
      var remove = uploadCard.querySelector('.upload-remove');
      if (remove) {
        remove.addEventListener('click', function (event) {
          event.stopPropagation();
          delete capabilityUploads[req.id];
          renderUploadCard();
        });
      }
    }

    function addGenericAttachment() {
      genericAttachment = { name: '课堂讲解录音.mp3', status: '审核中' };
      kbAttachment = null;
      renderUploadCard();
      showToast('音视频文件审核完成后可继续对话，请稍等');
      setTimeout(function () {
        if (!genericAttachment) return;
        genericAttachment.status = '处理完成';
        renderUploadCard();
        showToast(genericAttachment.name + '处理完成');
      }, 3200);
    }

    function openDockPlusMenu(anchor) {
      document.getElementById('ai-dock-plus-pop')?.remove();
      var rect = anchor.getBoundingClientRect();
      var pop = document.createElement('div');
      pop.id = 'ai-dock-plus-pop';
      pop.className = 'ai-dock-plus-pop';
      pop.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 220)) + 'px';
      pop.style.top = Math.max(16, rect.top - 94) + 'px';
      pop.innerHTML =
        '<button type="button" data-action="upload"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg><span>上传文件</span></button>' +
        '<button type="button" data-action="kb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span>从知识库添加</span></button>';
      pop.addEventListener('click', function (event) {
        event.stopPropagation();
        var action = event.target.closest('button')?.getAttribute('data-action');
        if (action === 'upload') {
          pop.remove();
          addGenericAttachment();
        }
        if (action === 'kb') {
          pop.remove();
          openDockKbPicker('plus');
        }
      });
      document.body.appendChild(pop);
      setTimeout(function () {
        document.addEventListener('click', function closePlus(event) {
          if (event.target.closest('#ai-dock-plus-pop')) return;
          document.getElementById('ai-dock-plus-pop')?.remove();
          document.removeEventListener('click', closePlus, true);
        }, true);
      }, 50);
    }

    function getDockKbIcon(type) {
      if (type === 'folder') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/></svg>';
      if (type === 'image') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
      if (type === 'audio') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 10v4"/><path d="M6 7v10"/><path d="M10 4v16"/><path d="M14 8v8"/><path d="M18 5v14"/><path d="M22 11v2"/></svg>';
      if (type === 'video') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>';
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
    }

    function findDockKbItem(id) {
      return Object.values(KB_CONTENT_ITEMS).flat().concat(Object.values(KB_CONTENT_CHILDREN).flat()).find(function (entry) {
        return entry.id === id;
      });
    }

    function openDockKbPicker(mode) {
      document.getElementById('ai-dock-kb-picker')?.remove();
      kbFolder = null;
      kbQuery = '';
      var rect = (mode === 'at' ? input : dock).getBoundingClientRect();
      var picker = document.createElement('div');
      picker.id = 'ai-dock-kb-picker';
      picker.className = 'ai-dock-kb-picker' + (mode === 'at' ? ' is-at-mode' : '');
      picker.dataset.mode = mode || 'plus';
      picker.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 436)) + 'px';
      picker.style.top = Math.max(16, rect.top - 532) + 'px';
      picker.addEventListener('click', function (event) { event.stopPropagation(); });
      document.body.appendChild(picker);
      renderDockKbPicker();
      setTimeout(function () {
        document.addEventListener('click', function closePicker(event) {
          if (event.target.closest('#ai-dock-kb-picker')) return;
          document.getElementById('ai-dock-kb-picker')?.remove();
          document.removeEventListener('click', closePicker, true);
        }, true);
      }, 50);
    }

    function renderDockKbPicker() {
      var picker = document.getElementById('ai-dock-kb-picker');
      if (!picker) return;
      var isAtMode = picker.dataset.mode === 'at';
      var baseList = kbFolder ? (KB_CONTENT_CHILDREN[kbFolder] || []) : (KB_CONTENT_ITEMS[kbTab] || []);
      var folder = findDockKbItem(kbFolder);
      var list = baseList.filter(function (item) {
        return !kbQuery || item.name.indexOf(kbQuery) >= 0;
      });
      picker.innerHTML =
        '<div class="ai-dock-kb-head"><span>知识库</span><button type="button" data-kb-close>×</button></div>' +
        '<div class="ai-dock-kb-tabs">' +
          '<button type="button" class="ai-dock-kb-tab ' + (kbTab === 'school' ? 'active' : '') + '" data-kb-tab="school">学校知识库</button>' +
          '<button type="button" class="ai-dock-kb-tab ' + (kbTab === 'mine' ? 'active' : '') + '" data-kb-tab="mine">个人知识库</button>' +
        '</div>' +
        '<div class="ai-dock-kb-search"><input placeholder="搜索当前知识库" value="' + kbQuery + '"></div>' +
        '<div class="ai-dock-kb-list">' +
          (kbFolder ? '<button type="button" class="ai-dock-kb-back" data-kb-back><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>返回上一级</button>' : '') +
          '<div class="ai-dock-kb-section">' + (kbFolder ? ((folder && folder.name) || '文件夹') + ' 内文件' : '按更新时间倒序') + '</div>' +
          list.map(function (item) {
            var checked = !isAtMode && kbAttachment && kbAttachment.id === item.id;
            return '<button type="button" class="ai-dock-kb-item ' + (item.disabled ? 'disabled' : '') + (checked ? ' is-checked' : '') + '" data-kb-id="' + item.id + '">' +
              '<span class="ai-dock-kb-check" aria-hidden="true" data-kb-check><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></span>' +
              '<span class="ai-dock-kb-icon">' + getDockKbIcon(item.type) + '</span>' +
              '<span class="ai-dock-kb-main"><span class="ai-dock-kb-name">' + item.name + '</span><span class="ai-dock-kb-meta">' + item.meta + '</span></span>' +
              (item.status ? '<span class="ai-dock-kb-status">' + item.status + '</span>' : '') +
            '</button>';
          }).join('') +
        '</div>';
      picker.querySelector('[data-kb-close]')?.addEventListener('click', function () { picker.remove(); });
      picker.querySelectorAll('[data-kb-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          kbTab = btn.getAttribute('data-kb-tab');
          kbQuery = '';
          kbFolder = null;
          renderDockKbPicker();
        });
      });
      picker.querySelector('[data-kb-back]')?.addEventListener('click', function () {
        kbFolder = null;
        kbQuery = '';
        renderDockKbPicker();
      });
      var search = picker.querySelector('.ai-dock-kb-search input');
      if (search) {
        search.addEventListener('input', function () {
          kbQuery = search.value;
          renderDockKbPicker();
        });
      }
      picker.querySelectorAll('[data-kb-id]').forEach(function (btn) {
        btn.addEventListener('click', function (event) {
          var item = findDockKbItem(btn.getAttribute('data-kb-id'));
          if (!item || item.disabled) return;
          if (event.target.closest('[data-kb-check]')) {
            selectDockKbItem(item, picker);
            return;
          }
          if (item.type === 'folder') {
            kbFolder = item.id;
            kbQuery = '';
            renderDockKbPicker();
            return;
          }
          selectDockKbItem(item, picker);
        });
      });
    }

    function selectDockKbItem(item, picker) {
      kbAttachment = { id: item.id, name: item.name };
      genericAttachment = null;
      renderUploadCard();
      if (picker.dataset.mode === 'at') input.value = input.value.replace(/@$/, '');
      picker.remove();
      showToast('已从知识库添加《' + item.name + '》');
    }

    function trySubmit() {
      if (genericAttachment && genericAttachment.status !== '处理完成') {
        showToast('音视频文件审核完成后可继续对话，请稍等');
        return;
      }
      submit(dock, input, activeCapability);
    }
	  }

  function getCapability(id) {
    if (!id) return null;
    return AI_CAPABILITIES.find(function (item) { return item.id === id; }) || null;
  }

  function getUploadRequirement(id) {
    if (id === 'interactive') return { id: 'interactive', label: '上传教案文件', fileName: '初英U1互动课件教案.docx', toast: '已添加教案文件' };
    if (id === 'data') return { id: 'data', label: '上传HTML文件', fileName: '课堂练习数据回收.html', toast: '已添加 HTML 文件' };
    return null;
  }

	  function submit(dock, input, activeCapability) {
	    var text = (input.value || '').trim();
	    if (!text) {
	      input.focus();
	      return;
	    }
	    var fixedIntent = dock.getAttribute('data-fixed-intent') || '';
	    var kind = fixedIntent === 'create-app' ? '应用' : (dock.getAttribute('data-kind') || '内容');
    var cap = getCapability(activeCapability);
	    var preview = text.length > 24 ? text.slice(0, 24) + '…' : text;
	    var prefix = fixedIntent === 'create-app' ? '已进入创建应用' : '已收到';
	    showToast(prefix + '「' + preview + '」· AI 正在为你生成' + (cap ? ' · ' + cap.label : kind));

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
