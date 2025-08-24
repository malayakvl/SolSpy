import { setSubDiagnosis } from '../Redux/Formula';
import { excludeToothEffect } from '../Constants'

export default function setupDiagnoze(
  toothNum,
  diagnoze,
  subdiagnoze,
  teethdiagnoze,
  dispatch,
  vinirColor,
  ceramicCrownColor,
  mceramicCrownColor,
  metalicCrownColor,
  zirconiaCrownColor,
  wsDefectColor
) {
  if (excludeToothEffect.includes(diagnoze)) {
  } else {
    teethdiagnoze[`tooth${toothNum}`].show = true;
    teethdiagnoze[`tooth${toothNum}`].active = true;
  }

  if (diagnoze === 'paradont_health') {
    teethdiagnoze[`tooth${toothNum}`].parodontit = false;
    teethdiagnoze[`tooth${toothNum}`].parodontit_stage = '';
    teethdiagnoze[`tooth${toothNum}`].paradont_health =
      !teethdiagnoze[`tooth${toothNum}`].paradont_health;
  } else if (diagnoze === 'inflamed_gums') {
    teethdiagnoze[`tooth${toothNum}`].significantly_gums = false;
    teethdiagnoze[`tooth${toothNum}`].inflamed_gums =
      !teethdiagnoze[`tooth${toothNum}`].inflamed_gums;
  } else if (diagnoze === 'no_inflammatory_process') {
    teethdiagnoze[`tooth${toothNum}`].significantly_gums = false;
    teethdiagnoze[`tooth${toothNum}`].inflamed_gums = false
  }
  else if (diagnoze === 'significantly_gums') {
    teethdiagnoze[`tooth${toothNum}`].inflamed_gums = false;
    teethdiagnoze[`tooth${toothNum}`].significantly_gums =
      !teethdiagnoze[`tooth${toothNum}`].significantly_gums;
  } else if (diagnoze === 'change_color')
    teethdiagnoze[`tooth${toothNum}`].change_color =
      !teethdiagnoze[`tooth${toothNum}`].change_color;
  else if (diagnoze === 'fissure')
    teethdiagnoze[`tooth${toothNum}`].fissure =
      !teethdiagnoze[`tooth${toothNum}`].fissure;
  else if (diagnoze === 'caries')
    teethdiagnoze[`tooth${toothNum}`].caries =
      !teethdiagnoze[`tooth${toothNum}`].caries;
  else if (diagnoze === 'cervical_caries')
    teethdiagnoze[`tooth${toothNum}`].cervical_caries =
      !teethdiagnoze[`tooth${toothNum}`].cervical_caries;
  else if (diagnoze === 'wedge_shaped_defect')
    teethdiagnoze[`tooth${toothNum}`].wedge_shaped_defect =
      !teethdiagnoze[`tooth${toothNum}`].wedge_shaped_defect;
  else if (diagnoze === 'tartar')
    teethdiagnoze[`tooth${toothNum}`].tartar =
      !teethdiagnoze[`tooth${toothNum}`].tartar;
  else if (diagnoze === 'pulpit') {
    teethdiagnoze[`tooth${toothNum}`].pulpit =
      !teethdiagnoze[`tooth${toothNum}`].pulpit;
    teethdiagnoze[`tooth${toothNum}`].channel_class = teethdiagnoze[
      `tooth${toothNum}`
    ].pulpit
      ? 'pulpit'
      : '';
  } else if (diagnoze === 'channel_not_sealed') {
    teethdiagnoze[`tooth${toothNum}`].channel_not_sealed =
      !teethdiagnoze[`tooth${toothNum}`].channel_not_sealed;
    teethdiagnoze[`tooth${toothNum}`].channel_class = teethdiagnoze[
      `tooth${toothNum}`
    ].channel_not_sealed
      ? 'channel-not-sealed'
      : '';
  } else if (diagnoze === 'channel_top_sealed') {
    teethdiagnoze[`tooth${toothNum}`].channel_top_sealed =
      !teethdiagnoze[`tooth${toothNum}`].channel_top_sealed;
    teethdiagnoze[`tooth${toothNum}`].channel_class = teethdiagnoze[
      `tooth${toothNum}`
    ].channel_top_sealed
      ? 'channel-top-sealed'
      : '';
  } else if (diagnoze === 'channel_part_sealed') {
    teethdiagnoze[`tooth${toothNum}`].channel_part_sealed =
      !teethdiagnoze[`tooth${toothNum}`].channel_part_sealed;
    teethdiagnoze[`tooth${toothNum}`].channel_class = teethdiagnoze[
      `tooth${toothNum}`
    ].channel_part_sealed
      ? 'channel-part-sealed'
      : '';
  } else if (diagnoze === 'periodontit') {
    if (teethdiagnoze[`tooth${toothNum}`].periodontit_stage !== subdiagnoze) {
      teethdiagnoze[`tooth${toothNum}`].periodontit_stage = subdiagnoze;
      teethdiagnoze[`tooth${toothNum}`].periodontit = true;
    } else {
      teethdiagnoze[`tooth${toothNum}`].periodontit =
        !teethdiagnoze[`tooth${toothNum}`].periodontit;
    }
    teethdiagnoze[`tooth${toothNum}`].channel_class = teethdiagnoze[
      `tooth${toothNum}`
    ].periodontit
      ? 'periodontit'
      : '';
    if (!teethdiagnoze[`tooth${toothNum}`].periodontit)
      dispatch(setSubDiagnosis(''));
  } else if (diagnoze === 'seal') {
    teethdiagnoze[`tooth${toothNum}`].seal =
      !teethdiagnoze[`tooth${toothNum}`].seal;
  } else if (diagnoze === 'seal_cervical') {
    if (
      !teethdiagnoze[`tooth${toothNum}`].seal_cervical &&
      (teethdiagnoze[`tooth${toothNum}`].seal_cervical_color === '' ||
        teethdiagnoze[`tooth${toothNum}`].seal_cervical_color === null)
    ) {
      teethdiagnoze[`tooth${toothNum}`].seal_cervical = true;
      teethdiagnoze[`tooth${toothNum}`].seal_cervical_color = wsDefectColor;
    } else if (
      teethdiagnoze[`tooth${toothNum}`].seal_cervical &&
      teethdiagnoze[`tooth${toothNum}`].seal_cervical_color != wsDefectColor
    ) {
      teethdiagnoze[`tooth${toothNum}`].seal_cervical_color = wsDefectColor;
    } else {
      teethdiagnoze[`tooth${toothNum}`].seal_cervical = false;
      teethdiagnoze[`tooth${toothNum}`].seal_cervical_color = '';
    }
  } else if (diagnoze === 'vinir') {
    if (
      !teethdiagnoze[`tooth${toothNum}`].vinir &&
      (teethdiagnoze[`tooth${toothNum}`].vinir_color === '' ||
        teethdiagnoze[`tooth${toothNum}`].vinir_color === null)
    ) {
      teethdiagnoze[`tooth${toothNum}`].vinir = true;
      teethdiagnoze[`tooth${toothNum}`].vinir_color = vinirColor;
    } else if (
      teethdiagnoze[`tooth${toothNum}`].vinir &&
      teethdiagnoze[`tooth${toothNum}`].vinir_color != vinirColor
    ) {
      teethdiagnoze[`tooth${toothNum}`].vinir_color = vinirColor;
    } else {
      teethdiagnoze[`tooth${toothNum}`].vinir = false;
      teethdiagnoze[`tooth${toothNum}`].vinir_color = '';
    }
  } else if (diagnoze === 'temporary_crown') {
    teethdiagnoze[`tooth${toothNum}`].temporary_crown =
      !teethdiagnoze[`tooth${toothNum}`].temporary_crown;
  } else if (diagnoze === 'ceramic_crown') {
    if (
      !teethdiagnoze[`tooth${toothNum}`].ceramic_crown &&
      (teethdiagnoze[`tooth${toothNum}`].ceramic_crown_color === '' ||
        teethdiagnoze[`tooth${toothNum}`].ceramic_crown_color === null)
    ) {
      teethdiagnoze[`tooth${toothNum}`].ceramic_crown = true;
      teethdiagnoze[`tooth${toothNum}`].ceramic_crown_color = ceramicCrownColor;
    } else if (
      teethdiagnoze[`tooth${toothNum}`].ceramic_crown &&
      teethdiagnoze[`tooth${toothNum}`].ceramic_crown_color != ceramicCrownColor
    ) {
      teethdiagnoze[`tooth${toothNum}`].ceramic_crown_color = ceramicCrownColor;
    } else {
      teethdiagnoze[`tooth${toothNum}`].ceramic_crown = false;
      teethdiagnoze[`tooth${toothNum}`].ceramic_crown_color = '';
    }
  } else if (diagnoze === 'mceramic_crown') {
    if (
      !teethdiagnoze[`tooth${toothNum}`].mceramic_crown &&
      (teethdiagnoze[`tooth${toothNum}`].mceramic_crown_color === '' ||
        teethdiagnoze[`tooth${toothNum}`].mceramic_crown_color === null)
    ) {
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown = true;
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown_color =
        mceramicCrownColor;
    } else if (
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown &&
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown_color !=
        mceramicCrownColor
    ) {
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown_color =
        mceramicCrownColor;
    } else {
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown = false;
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown_color = '';
    }
  } else if (diagnoze === 'metalic_crown') {
    if (
      !teethdiagnoze[`tooth${toothNum}`].metalic_crown &&
      (teethdiagnoze[`tooth${toothNum}`].metalic_crown_color === '' ||
        teethdiagnoze[`tooth${toothNum}`].metalic_crown_color === null)
    ) {
      teethdiagnoze[`tooth${toothNum}`].metalic_crown = true;
      teethdiagnoze[`tooth${toothNum}`].metalic_crown_color = metalicCrownColor;
    } else if (
      teethdiagnoze[`tooth${toothNum}`].metalic_crown &&
      teethdiagnoze[`tooth${toothNum}`].metalic_crown_color != metalicCrownColor
    ) {
      teethdiagnoze[`tooth${toothNum}`].mceramic_crown_color =
        metalicCrownColor;
    } else {
      teethdiagnoze[`tooth${toothNum}`].metalic_crown = false;
      teethdiagnoze[`tooth${toothNum}`].metalic_crown_color = '';
    }
  } else if (diagnoze === 'zirconia_crown') {
    if (
      !teethdiagnoze[`tooth${toothNum}`].zirconia_crown &&
      (teethdiagnoze[`tooth${toothNum}`].zirconia_crown_color === '' ||
        teethdiagnoze[`tooth${toothNum}`].zirconia_crown_color === null)
    ) {
      teethdiagnoze[`tooth${toothNum}`].zirconia_crown = true;
      teethdiagnoze[`tooth${toothNum}`].zirconia_crown_color =
        zirconiaCrownColor;
    } else if (
      teethdiagnoze[`tooth${toothNum}`].zirconia_crown &&
      teethdiagnoze[`tooth${toothNum}`].zirconia_crown_color !=
        zirconiaCrownColor
    ) {
      teethdiagnoze[`tooth${toothNum}`].zirconia_crown_color =
        zirconiaCrownColor;
    } else {
      teethdiagnoze[`tooth${toothNum}`].zirconia_crown = false;
      teethdiagnoze[`tooth${toothNum}`].zirconia_crown_color = '';
    }
  } else if (diagnoze === 'pin') {
    teethdiagnoze[`tooth${toothNum}`].pin =
      !teethdiagnoze[`tooth${toothNum}`].pin;
  } else if (diagnoze === 'culttab') {
    teethdiagnoze[`tooth${toothNum}`].culttab =
      !teethdiagnoze[`tooth${toothNum}`].culttab;
  } else if (diagnoze === 'abutment') {
    teethdiagnoze[`tooth${toothNum}`].abutment =
      !teethdiagnoze[`tooth${toothNum}`].abutment;
  } else if (diagnoze === 'shaper') {
    teethdiagnoze[`tooth${toothNum}`].shaper =
      !teethdiagnoze[`tooth${toothNum}`].shaper;
  } else if (diagnoze === 'implant') {
    teethdiagnoze[`tooth${toothNum}`].implant =
      !teethdiagnoze[`tooth${toothNum}`].implant;
  } else if (diagnoze === 'apex') {
    teethdiagnoze[`tooth${toothNum}`].apex =
      !teethdiagnoze[`tooth${toothNum}`].apex;
  } else if (diagnoze === 'absent') {
    teethdiagnoze[`tooth${toothNum}`].absent =
      !teethdiagnoze[`tooth${toothNum}`].absent;
  } else if (diagnoze === 'cervical_caries') {
    teethdiagnoze[`tooth${toothNum}`].cervical_caries =
      !teethdiagnoze[`tooth${toothNum}`].cervical_caries;
  } else if (diagnoze === 'caries') {
    teethdiagnoze[`tooth${toothNum}`].caries =
      !teethdiagnoze[`tooth${toothNum}`].caries;
  } else if (diagnoze === 'parodontit') {
    teethdiagnoze[`tooth${toothNum}`].paradont_health = false;
    if (teethdiagnoze[`tooth${toothNum}`].parodontit) {
      if (teethdiagnoze[`tooth${toothNum}`].parodontit_stage === subdiagnoze) {
        teethdiagnoze[`tooth${toothNum}`].parodontit = false;
        teethdiagnoze[`tooth${toothNum}`].active = false;
      } else {
        teethdiagnoze[`tooth${toothNum}`].parodontit = true;
        teethdiagnoze[`tooth${toothNum}`].parodontit_stage = subdiagnoze;
      }
    } else {
      teethdiagnoze[`tooth${toothNum}`].parodontit = true;
      teethdiagnoze[`tooth${toothNum}`].parodontit_stage = subdiagnoze;
      teethdiagnoze[`tooth${toothNum}`].active = true;
    }
  }
  return teethdiagnoze[`tooth${toothNum}`];
}
