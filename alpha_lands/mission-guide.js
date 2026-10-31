/* One shared source of truth for the four goals and the next physical action. */
window.AlphaGuide = {
  goals(state) {
    return [
      {id:'research',title:'做出 3 种成果',progress:`${Math.min(3,state.done.length)} / 3`,done:state.done.length>=3,hint:'数据和工具放在一起，得到研究成果。'},
      {id:'validate',title:'验证 1 份报告',progress:`${Math.min(1,state.behavior.validated)} / 1`,done:state.behavior.validated>0,hint:'报告 + 回测工具 → 验证策略。'},
      {id:'event',title:'完成 1 次市场选择',progress:`${Math.min(1,state.behavior.events)} / 1`,done:state.behavior.events>0,hint:'结束回合，再选一种应对方式。'},
      {id:'knowledge',title:'答对 1 道研究题',progress:state.challenge.passed?'1 / 1':'0 / 1',done:state.challenge.passed,hint:'判断怎样检验一个研究想法。'}
    ];
  },
  plan(state, recipes, shop) {
    const goals=this.goals(state);
    const goal=goals.find(g=>g.id===state.guideGoal&&!g.done)||goals.find(g=>!g.done);
    if(!goal)return {goal:'finish',type:'finish',title:'四个任务都完成了',label:'领取研究档案'};
    const has=key=>state.cards.some(c=>c.key===key);
    const prices=Object.fromEntries(shop);
    function price(key,trail=[]){
      if(has(key))return 0;
      if(Object.hasOwn(prices,key))return prices[key];
      if(trail.includes(key))return Infinity;
      return Math.min(...recipes.filter(r=>r.out===key).map(r=>price(r.a,[...trail,key])+price(r.b,[...trail,key])));
    }
    function choose(list){return [...list].sort((a,b)=>(price(a.a)+price(a.b))-(price(b.a)+price(b.b)))[0]}
    function need(key,trail=[]){
      if(has(key))return null;
      if(Object.hasOwn(prices,key))return {type:'buy',key,cost:prices[key]};
      if(trail.includes(key))return null;
      const r=choose(recipes.filter(r=>r.out===key&&!trail.includes(r.a)&&!trail.includes(r.b)));
      return r?prepare(r,[...trail,key]):null;
    }
    function prepare(r,trail=[]){return need(r.a,trail)||need(r.b,trail)||{type:'combine',a:r.a,b:r.b,out:r.out}}
    let action;
    if(state.pendingEvent!==null)action={type:'event'};
    else if(goal.id==='knowledge')action={type:'knowledge'};
    else if(goal.id==='event')action={type:'next'};
    else {
      const candidates=recipes.filter(r=>goal.id==='validate'?r.out==='tested':!state.done.includes(r.out)&&['trendReport','valueReport','factorReport','riskReport','tested'].includes(r.out));
      action=prepare(choose(candidates));
      if(action.type==='combine'&&state.energy<1)action={type:'next',recovery:'energy'};
      if(action.type==='buy'&&state.money<action.cost)action={type:'next',recovery:'money'};
    }
    return {goal:goal.id,title:goal.title,progress:goal.progress,...action};
  }
};
