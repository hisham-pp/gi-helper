import { nahida, nahidaGoalTemplates } from "./nahida";
import { raiden, raidenGoalTemplates } from "./raiden";
import { zhongli, zhongliGoalTemplates } from "./zhongli";
import { kazuha, kazuhaGoalTemplates } from "./kazuha";
import { hutao, hutaoGoalTemplates } from "./hutao";
import { yelan, yelanGoalTemplates } from "./yelan";
import { bennett, bennettGoalTemplates } from "./bennett";
import { xingqiu, xingqiuGoalTemplates } from "./xingqiu";
import { navia, naviaGoalTemplates } from "./navia";
import { varka, varkaGoalTemplates } from "./varka";
import { nefer, neferGoalTemplates } from "./nefer";

export const characters = [
  nahida,
  raiden,
  zhongli,
  kazuha,
  hutao,
  yelan,
  bennett,
  xingqiu,
  navia,
  varka,
  nefer,
];

export const characterGoalTemplates = [
  ...nahidaGoalTemplates,
  ...raidenGoalTemplates,
  ...zhongliGoalTemplates,
  ...kazuhaGoalTemplates,
  ...hutaoGoalTemplates,
  ...yelanGoalTemplates,
  ...bennettGoalTemplates,
  ...xingqiuGoalTemplates,
  ...naviaGoalTemplates,
  ...varkaGoalTemplates,
  ...neferGoalTemplates,
];
