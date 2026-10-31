/* Scripted personas, not real playtesters. Every action runs the normal game handlers. */
window.AlphaDemoPaths = {
  fox:{name:'路径 A · 假设验证型',steps:[
    ['新玩家从五张基础卡开始；这里跳过教程，只演示自主操作。','start',null,7],
    ['将行情数据与策略假设合成，形成因子报告。','combine',['market','hyp'],8],
    ['购买回测工具，研究资源会实际扣减。','buy','backtest',5],
    ['把因子报告交给回测工具：卡牌流程完成验证环节。','combine',['factorReport','backtest'],8],
    ['另用财务数据和估值模型，形成第三种成果。','combine',['fund','value'],7],
    ['结束回合，进入一个明确标注为模拟的市场情景。','next',null,5],
    ['本路径选择检查指标并验证假设，而非追逐最高收益。','event',1,5],
    ['知识题单独记录，不把游戏熟练度当成量化能力。','knowledge',null,7],
    ['选择使用未参与调参的数据，并考虑成本。','answer',1,6],
    ['研究闭环完成：多场景证据支持狐狸倾向，结果仍可修正。','profile',null,10],
    ['推荐进入真实数据的样本外验证任务，先隐藏后续价格。','real','fox',10],
    ['先固定规则，再揭晓后续 20 日；涨跌不决定能力分。','commit',['fox',0],10],
    ['具体 QuantSkills 资源连接样本隔离练习，不只是通用网站链接。','learn',null,9],
    ['选择未见样本，完成有提示的学习任务。','learningAnswer',true,6]
  ]},
  owl:{name:'路径 B · 风险研究型',steps:[
    ['第二条路径从独立新局开始，不改动你的个人存档。','start',null,5],
    ['购买波动数据。','buy','vol',4],
    ['购买风险模型。','buy','risk',4],
    ['波动数据与风险模型合成风险报告。','combine',['vol','risk'],7],
    ['购买回测工具。','buy','backtest',4],
    ['继续验证风险报告，留下另一项自主研究证据。','combine',['riskReport','backtest'],7],
    ['也完成趋势报告，展示画像允许跨路线研究。','combine',['market','trend'],6],
    ['进入同一市场情景。','next',null,4],
    ['这次优先衡量异常波动与风险，后续推荐随之变化。','event',3,5],
    ['知识检验与第一位玩家保持一致，排除只按答题定物种。','knowledge',null,4],
    ['完成样本外验证概念判断。','answer',1,4],
    ['多个风险线索支持猫头鹰倾向，推荐成本核查资源。','profile',null,10],
    ['同一组真实行情，这次进入回撤实验。','real','owl',8],
    ['认识到历史回撤不是未来损失上限，再揭晓走势。','commit',['owl',1],8],
    ['进入与第一条路径不同的成本练习。','learn',null,8],
    ['修改成本假设后，净利润立即变化；示例明确标注为教学数据。','cost',0.001,7],
    ['披露毛净利润和成本假设，学习完成不增加能力分。','learningAnswer',true,5]
  ]}
};
