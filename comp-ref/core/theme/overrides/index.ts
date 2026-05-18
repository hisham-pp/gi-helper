import MuiButton from './button';
import Card from './card';
import MuiList from './list';
import Paper from './paper';
import MuiRadio from './radio';
import MuiSwitches from './switches';
import MuiTextField from './textfield';
import MuiTooltip from './tooltip';

const Overrides = () => {
  const card = Card();
  const paper = Paper();
  const list = MuiList();
  const button = MuiButton();
  const switches = MuiSwitches();
  const radio = MuiRadio();
  const tooltip = MuiTooltip();
  const textfield = MuiTextField();

  return Object.assign(button, paper, card, list, switches, radio, tooltip, textfield);
};

export default Overrides;
