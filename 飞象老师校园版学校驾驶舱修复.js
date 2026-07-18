(() => {
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  // First pass: the legacy inline script still uses innerHTML for the school name.
  // Give it an HTML-escaped value so an URL parameter can never become markup.
  if (!window.__campusDashboardPatch) {
    const NativeURLSearchParams = window.URLSearchParams;
    const school = new NativeURLSearchParams(location.search).get('school') || '虹口区实验学校';
    window.__campusDashboardPatch = { NativeURLSearchParams, school };
    window.URLSearchParams = class SafeURLSearchParams extends NativeURLSearchParams {
      get(name) {
        return name === 'school' ? escapeHtml(school) : super.get(name);
      }
    };
    return;
  }

  const { school } = window.__campusDashboardPatch;
  const schoolTitle = document.getElementById('school-title');
  if (!schoolTitle || !window.echarts) return;

  // The page is a campus dashboard: restore its campus panels after the legacy
  // script has finished, then own the period controls with consistent data.
  document.title = `${school} · 飞象老师校园版`;
  schoolTitle.replaceChildren(document.createTextNode(`${school} · `), Object.assign(document.createElement('b'), { textContent: 'AI+ 教育' }), document.createTextNode(' 驾驶舱'));

  document.querySelector('.school-left').innerHTML = `
    <article class="panel trend"><div class="phead"><h2>近 7 天使用趋势</h2><div class="tabset"><button class="on" data-mode="student">学生</button><button data-mode="teacher">教师</button></div></div><div id="trend" class="chart"></div></article>
    <article class="panel apps"><div class="phead"><h2>热门 AI 应用</h2><span>使用次数</span></div><div class="app-list"><div class="app-row"><b class="app-rank">01</b><span class="app-name">智能作业批改<i><b style="width:100%"></b></i></span><span class="app-num">2,840<small>次</small></span></div><div class="app-row"><b class="app-rank">02</b><span class="app-name">AI 视频课程<i><b style="width:85%"></b></i></span><span class="app-num">2,416<small>次</small></span></div><div class="app-row"><b class="app-rank">03</b><span class="app-name">拍照答疑<i><b style="width:62%"></b></i></span><span class="app-num">1,786<small>次</small></span></div><div class="app-row"><b class="app-rank">04</b><span class="app-name">AI 对话<i><b style="width:55%"></b></i></span><span class="app-num">1,554<small>次</small></span></div></div></article>
    <article class="panel benchmark"><div class="phead"><h2>校区—区域对标</h2><span>近 30 天</span></div><div class="benchmark-head"><span>核心指标</span><span>本校</span><span>区域</span></div><div class="benchmark-list"><div class="benchmark-row"><span>教师活跃率</span><b>68%</b><i>52%</i></div><div class="benchmark-row"><span>资源复用率</span><b>34.6%</b><i>28.1%</i></div><div class="benchmark-row"><span>人均资源沉淀</span><b>5.8</b><i>4.1</i></div><div class="benchmark-row"><span>学生周使用人数</span><b>1,286</b><i>1,042</i></div></div></article>`;

  document.querySelector('.grid > aside:last-child').innerHTML = `
    <article class="panel resource"><div class="phead"><h2>校本资源结构</h2><span>42 项</span></div><div id="resource" class="resource-chart"></div></article>
    <article class="panel teacher"><div class="phead"><h2>教师创作领航</h2><span>本周</span></div><div class="teacher-list"><div class="teacher-row"><i class="avatar">王</i><span><b>王红敏</b>古诗文闯关 · 互动应用</span><strong class="teacher-score">98</strong></div><div class="teacher-row"><i class="avatar">刘</i><span><b>刘国顺</b>错因追踪 · 学习应用</span><strong class="teacher-score">92</strong></div><div class="teacher-row"><i class="avatar">陈</i><span><b>陈欣</b>项目式学习 · 资源包</span><strong class="teacher-score">87</strong></div><div class="teacher-row"><i class="avatar">黄</i><span><b>黄婷婷</b>实验报告 · 教学应用</span><strong class="teacher-score">82</strong></div></div></article>`;

  const dispose = id => {
    const element = document.getElementById(id);
    const instance = element && echarts.getInstanceByDom(element);
    if (instance) instance.dispose();
  };
  dispose('trend');
  dispose('resource');

  const trend = echarts.init(document.getElementById('trend'));
  const resource = echarts.init(document.getElementById('resource'));
  const trendData = [2200, 2860, 2440, 3280, 3650, 3420, 4018];
  let mode = 'student';
  let activeDays = 7;
  const format = value => Math.round(value).toLocaleString('zh-CN');

  resource.setOption({
    title:{text:'42',subtext:'校本资源',left:'center',top:'35%',textStyle:{color:'#fff',fontSize:21},subtextStyle:{color:'rgba(220,233,255,.53)',fontSize:9}},
    tooltip:{trigger:'item',backgroundColor:'rgba(12,20,48,.96)',borderColor:'rgba(158,130,255,.72)',borderWidth:1,textStyle:{color:'#edf5ff',fontSize:10},formatter:point => `<b style="color:#bcaaff">${point.name}</b><br/>校本资源：<b>${point.value} 项</b><br/><span style="color:rgba(220,235,255,.68)">占资源总量 ${point.percent}%</span>`},
    series:[{type:'pie',radius:['54%','76%'],center:['50%','53%'],label:{show:false},data:[{name:'题单',value:15,itemStyle:{color:'#9d82ff'}},{name:'课件',value:11,itemStyle:{color:'#35c8f6'}},{name:'应用',value:8,itemStyle:{color:'#2fd5b6'}},{name:'文件',value:8,itemStyle:{color:'#f8d95c'}}]}]
  });

  const updateTrend = days => {
    activeDays = days;
    const points = days === 7 ? 7 : days === 30 ? 10 : 12;
    const labels = Array.from({length:points}, (_, index) => days === 7 ? `7.${12 + index}` : `第 ${index + 1} 日`);
    const students = Array.from({length:points}, (_, index) => trendData[index % trendData.length] + Math.floor(index / trendData.length) * 220);
    const values = mode === 'student' ? students : students.map(value => Math.round(value * 0.075));
    trend.setOption({
      grid:{left:31,right:12,top:18,bottom:25},
      tooltip:{trigger:'axis',backgroundColor:'rgba(12,20,48,.96)',borderColor:'rgba(76,195,255,.62)',borderWidth:1,textStyle:{color:'#edf5ff',fontSize:10},axisPointer:{lineStyle:{color:'rgba(120,175,255,.55)'}},formatter:params => `<b style="color:#bcaaff">${params[0].axisValue}</b><br/>${mode === 'student' ? '学生' : '教师'}使用人数：<b>${format(params[0].data)} 人</b>`},
      xAxis:{type:'category',data:labels,axisLabel:{color:'rgba(220,233,255,.48)',fontSize:9},axisTick:{show:false},axisLine:{lineStyle:{color:'rgba(120,165,240,.2)'}}},
      yAxis:{type:'value',axisLabel:{color:'rgba(220,233,255,.4)',fontSize:9,formatter:value => value >= 1000 ? `${Math.round(value / 1000)}k` : value},splitLine:{lineStyle:{color:'rgba(120,165,240,.12)'}},axisLine:{show:false}},
      series:[{type:'line',smooth:true,symbol:'none',lineStyle:{color:'#35c8f6',width:2},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(53,200,246,.32)'},{offset:1,color:'rgba(53,200,246,0)'}])},data:values}]
    }, true);
    document.querySelector('.trend .phead h2').textContent = `近 ${days} 天使用趋势`;
    document.querySelectorAll('.range').forEach(button => button.classList.toggle('on', Number(button.dataset.days) === days));
  };

  document.querySelectorAll('.range').forEach(button => {
    button.onclick = () => updateTrend(Number(button.dataset.days));
  });
  document.querySelectorAll('.tabset button').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('.tabset button').forEach(item => item.classList.toggle('on', item === button));
      mode = button.dataset.mode;
      updateTrend(activeDays);
    };
  });
  addEventListener('resize', () => { trend.resize(); resource.resize(); });
  updateTrend(7);
})();
