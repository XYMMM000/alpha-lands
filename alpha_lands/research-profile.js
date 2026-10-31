/* Rules for this game session; confidence labels are not statistical probabilities. */
window.AlphaProfile = {
  evaluate(evidence, recipes) {
    const weights = {cheetah:0, fox:0, elephant:0, owl:0};
    const used = new Set(), facts = [], sources = new Set();
    for (const e of evidence) {
      if (e.guided) continue;
      let kind, key, weight = 0;
      if (e.type === 'combine') {
        const r = recipes.find(r => r.out === e.detail.output &&
          e.detail.inputs.includes(r.a) && e.detail.inputs.includes(r.b));
        if (r) {kind=r.score;key='combine:'+r.a+':'+r.b;weight=3;}
      } else if (e.type === 'event') {
        kind=e.detail.kind;key='event:'+e.detail.event;weight=2;
      } else if (e.type === 'real_research') {
        kind=e.detail.kind;key='real_research:'+kind;weight=2;
      } else if (e.type === 'followup' && e.detail.question === 'attention') {
        kind=e.detail.kind;key='followup:attention';weight=1;
      }
      if (!Object.hasOwn(weights,kind) || used.has(key)) continue;
      used.add(key);weights[kind]+=weight;sources.add(e.type);
      facts.push({type:e.type,kind,weight,round:e.round,key});
    }
    const ranked=Object.entries(weights).sort((a,b)=>b[1]-a[1]);
    const total=ranked.reduce((sum,[,v])=>sum+v,0);
    const gap=total?(ranked[0][1]-ranked[1][1])/total:0;
    const status=facts.length<3||sources.size<2?'insufficient':gap<0.25?'mixed':'supported';
    return {status,kind:total?ranked[0][0]:null,weights,total,count:facts.length,
      sources:[...sources],facts,gap,uncertainties:[
        ...(status==='insufficient'?['自主研究证据不足：至少需要 3 项不同操作，覆盖 2 类场景。']:[]),
        ...(status==='mixed'?['不同线索支持多条路线，暂不归为单一物种。']:[]),
        '这是本局研究习惯的规则摘要，不是交易能力或风险承受能力评估。',
        '初始卡牌、资源限制和对玩法的熟悉程度仍可能影响选择。'
      ]};
  }
};
