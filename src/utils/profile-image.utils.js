const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fetch = require('node-fetch').default;

const {
  otherImgs,
  otherBadges,
  nitroBadges,
  statusImgs,
} = require('../../public/profile-image.files.json');

const badgesOrder = require('../config/badges-order.json');
const {
  parseUsername,
  abbreviateNumber,
  getDateOrString,
} = require('../utils/strings.utils');
const {
  parseImg,
  parseHex,
  parsePng,
  isString,
  isNumber,
} = require('../utils/validations.utils');

const alphaValue = 0.4;

async function getBadges(data, options) {
  const { public_flags_array, bot, id } = data;

  const badges = [],
    flagsUser = public_flags_array.sort(
      (a, b) => badgesOrder[b] - badgesOrder[a]
    );

  if (data.discriminator === '0') {
    const badge = await loadImage(
      Buffer.from(otherBadges.NEW_USERNAME, 'base64')
    );
    badges.push({ canvas: badge, x: 0, y: 15, w: 60 });
  }

  if (bot) {
    const botFetch = await fetch(
      `https://discord.com/api/v10/applications/${id}/rpc`
    );

    const json = await botFetch.json();
    let flagsBot = json.flags;

    const gateways = {
      APPLICATION_COMMAND_BADGE: 1 << 23,
      AUTOMOD_RULE_CREATE_BADGE: 1 << 6,
    };

    const arrayFlags = [];
    for (let i in gateways) {
      const bit = gateways[i];
      if ((flagsBot & bit) === bit) arrayFlags.push(i);
    }

    if (arrayFlags.includes('AUTOMOD_RULE_CREATE_BADGE')) {
      const automodBadge = await loadImage(
        Buffer.from(otherBadges.AUTOMODBOT, 'base64')
      );
      badges.push({ canvas: automodBadge, x: 0, y: 15, w: 60 });
    }
    if (arrayFlags.includes('APPLICATION_COMMAND_BADGE')) {
      const slashBadge = await loadImage(
        Buffer.from(otherBadges.SLASHBOT, 'base64')
      );
      badges.push({ canvas: slashBadge, x: 0, y: 15, w: 60 });
    }
  } else {
    for (let i = 0; i < flagsUser.length; i++) {
      if (flagsUser[i].startsWith('BOOSTER')) {
        const badge = await loadImage(
          Buffer.from(nitroBadges[flagsUser[i]], 'base64')
        );
        badges.push({ canvas: badge, x: 0, y: 15, w: 60 });
      } else if (flagsUser[i].startsWith('NITRO')) {
        const badge = await loadImage(
          Buffer.from(otherBadges[flagsUser[i]], 'base64')
        );
        badges.push({ canvas: badge, x: 0, y: 15, w: 60 });
      } else {
        const badge = await loadImage(
          Buffer.from(otherBadges[flagsUser[i]], 'base64')
        );
        badges.push({ canvas: badge, x: 0, y: 15, w: 60 });
      }
    }
  }

  if (options?.customBadges?.length) {
    if (options?.overwriteBadges) {
      badges = [];
    }

    for (let i = 0; i < options.customBadges.length; i++) {
      const canvas = await loadImage(parsePng(options.customBadges[i]));
      badges.push({ canvas: canvas, x: 10, y: 22, w: 46 });
    }
  }

  return badges;
}

async function genBase(options, avatarData, bannerData) {
  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

  const cardBackground = await loadImage(
    options?.customBackground
      ? parseImg(options.customBackground)
      : bannerData ?? avatarData
  );

  const condAvatar = options?.customBackground ? true : bannerData !== null;
  const wX = condAvatar ? 885 : 900;
  const wY = condAvatar ? 303 : wX;
  const cY = condAvatar ? 0 : -345;

  ctx.fillStyle = '#18191c';
  ctx.beginPath();
  ctx.fillRect(0, 0, 885, 303);
  ctx.fill();

  ctx.filter =
    (options?.moreBackgroundBlur ? 'blur(9px)' : 'blur(3px)') +
    (options?.backgroundBrightness
      ? ` brightness(${options.backgroundBrightness + 100}%)`
      : '');
  ctx.drawImage(cardBackground, 0, cY, wX, wY);

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#2a2d33';
  ctx.beginPath();
  ctx.fillRect(0, 0, 885, 303);
  ctx.fill();

  return canvas;
}

async function genFrame(badgesLength, options) {
  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

  const cardFrame = await loadImage(Buffer.from(otherImgs.frame, 'base64'));

  ctx.globalCompositeOperation = 'source-out';
  ctx.globalAlpha = 0.5;
  ctx.drawImage(cardFrame, 0, 0, 885, 303);
  ctx.globalCompositeOperation = 'source-over';

  ctx.globalAlpha = alphaValue;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.roundRect(696, 248, 165, 33, [12]);
  ctx.fill();
  ctx.globalAlpha = 1;

<<<<<<< HEAD:src/utils/profile-image.utils.js
=======
  let badgesLength =
    (options?.overwriteBadges && options?.customBadges?.length
      ? 0
      : data.public_flags_array.length) +
    (options?.customBadges?.length ? options?.customBadges?.length : 0);

  if (data.bot) {
    let bd = await fetch(`https://discord.com/api/v10/applications/${data.id}/rpc`);
    let dbJson = await bd.json();

    let flagsBot = dbJson.flags;

    const gateways = {
      APPLICATION_COMMAND_BADGE: 1 << 23,
      AUTOMOD_RULE_CREATE_BADGE: 1 << 6
    };

    const arrayFlags = [];
    for (let i in gateways) {
      const bit = gateways[i];
      if ((flagsBot & bit) === bit) arrayFlags.push(i);
    }

    badgesLength = badgesLength + arrayFlags.length;

    if(data.public_flags_array.includes('VERIFIED_BOT')) badgesLength--
    if(data.public_flags_array.includes('BOT_HTTP_INTERACTIONS')) badgesLength--
  }

>>>>>>> 227cc021d82c518d639503b12a189e59e7f4e72c:src/Code/profileImage.js
  if (options?.badgesFrame && badgesLength > 0 && !options?.removeBadges) {
    ctx.fillStyle = '#000';
    ctx.globalAlpha = alphaValue;
    ctx.beginPath();
    ctx.roundRect(
      800 - 60 * (badgesLength - 1) - 3,
      15,
      60 * badgesLength + 8,
      60,
      [17]
    );
    ctx.fill();
  }

  return canvas;
}

async function genBorder(options) {
  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

  const borderColors = [];
  if (typeof options.borderColor == 'string')
    borderColors.push(options.borderColor);
  else borderColors.push(...options.borderColor);

  if (borderColors.length > 2)
    throw new Error(
      `Discord Arts | Invalid borderColor length (${borderColors.length}) must be a maximum of 2 colors`
    );

  const gradX = options.borderAllign == 'vertical' ? 0 : 885;
  const gradY = options.borderAllign == 'vertical' ? 303 : 0;

  const grd = ctx.createLinearGradient(0, 0, gradX, gradY);

  for (let i = 0; i < borderColors.length; i++) {
    grd.addColorStop(i, parseHex(borderColors[i]));
  }

  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.fillRect(0, 0, 885, 303);

  ctx.globalCompositeOperation = 'destination-out';

  ctx.beginPath();
  ctx.roundRect(9, 9, 867, 285, [25]);
  ctx.fill();

  return canvas;
}

async function genTextAndAvatar(data, options, avatarData) {
  const {
    global_name,
    username: rawUsername,
    discriminator,
    bot,
    createdTimestamp,
  } = data;

  const pixelLength = bot ? 470 : 555;

  let canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

  const fixedUsername = global_name || rawUsername;

  const { username, newSize } = parseUsername(
    fixedUsername,
    ctx,
    'Helvetica Bold',
    '80',
    pixelLength
  );

  const createdDateString = getDateOrString(
    options?.customDate,
    createdTimestamp
  );

  const tag = options?.customTag
    ? isString(options.customTag, 'customTag')
    : discriminator === '0'
    ? `@${data.username}`
    : `#${discriminator}`;

  ctx.font = `${newSize}px Helvetica Bold`;
  ctx.textAlign = 'left';
  ctx.fillStyle = options?.usernameColor
    ? parseHex(options.usernameColor)
    : '#FFFFFF';
  ctx.fillText(username, 300, 155);

  if (!options?.rankData) {
    ctx.font = '60px Helvetica';
    ctx.fillStyle = options?.tagColor ? parseHex(options.tagColor) : '#dadada';
    ctx.fillText(tag, 300, 215);
  }

  ctx.font = '23px Helvetica';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dadada';
  ctx.fillText(createdDateString, 775, 273);

  const cardAvatar = await loadImage(avatarData);

  const roundValue = options?.squareAvatar ? 30 : 225;

  ctx.beginPath();
  ctx.roundRect(47, 39, 225, 225, [roundValue]);
  ctx.clip();

  ctx.fillStyle = '#292b2f';
  ctx.beginPath();
  ctx.roundRect(47, 39, 225, 225, [roundValue]);
  ctx.fill();

  ctx.drawImage(cardAvatar, 47, 39, 225, 225);

  ctx.closePath();

  if (options?.presenceStatus) {
    canvas = await genStatus(canvas, options);
  }

  return canvas;
}

async function genStatus(canvasToEdit, options) {
  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

  const validStatus = [
    'idle',
    'dnd',
    'online',
    'invisible',
    'offline',
    'streaming',
    'phone',
  ];

  if (!validStatus.includes(options.presenceStatus))
    throw new Error(
      `Discord Arts | Invalid presenceStatus ('${options.presenceStatus}') must be 'online' | 'idle' | 'offline' | 'dnd' | 'invisible' | 'streaming' | 'phone'`
    );

  const statusString =
    options.presenceStatus == 'offline' ? 'invisible' : options.presenceStatus;

  const status = await loadImage(
    Buffer.from(statusImgs[statusString], 'base64')
  );

  const cX = options.presenceStatus == 'phone' ? 224.5 : 212;
  const cY = options.presenceStatus == 'phone' ? 202 : 204;

  ctx.drawImage(canvasToEdit, 0, 0);

  ctx.globalCompositeOperation = 'destination-out';

  if (options.presenceStatus == 'phone')
    ctx.roundRect(cX - 8, cY - 8, 57, 78, [10]);
  else ctx.roundRect(212, 204, 62, 62, [62]);
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';

  ctx.drawImage(status, cX, cY);

  return canvas;
}

async function genBadges(badges) {
  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

<<<<<<< HEAD:src/utils/profile-image.utils.js
=======
  const pixelLength = bot ? 470 : 555;

  const { textLength } = parseUsername(
    rawUsername,
    ctx,
    'Helvetica Bold',
    '80',
    pixelLength
  );

  let badges = [],
    flagsUser = public_flags_array.sort(
      (a, b) => badgesOrder[b] - badgesOrder[a]
    );
  let botBagde;

  if (bot) {
    const botFetch = await fetch(
      `https://discord.com/api/v10/applications/${id}/rpc`
    );

    const json = await botFetch.json();
    let flagsBot = json.flags;

    const gateways = {
      APPLICATION_COMMAND_BADGE: 1 << 23,
      AUTOMOD_RULE_CREATE_BADGE: 1 << 6
    };

    const arrayFlags = [];
    for (let i in gateways) {
      const bit = gateways[i];
      if ((flagsBot & bit) === bit) arrayFlags.push(i);
    }

    const botVerifBadge =
      otherImgs[flagsUser.includes('VERIFIED_BOT') ? 'botVerif' : 'botNoVerif'];
    botBagde = await loadImage(Buffer.from(botVerifBadge, 'base64'));

    if (arrayFlags.includes('APPLICATION_COMMAND_BADGE')) {
      const slashBadge = await loadImage(
        Buffer.from(otherBadges.SLASHBOT, 'base64')
      );
      badges.push({ canvas: slashBadge, x: 0, y: 15, w: 60 });
    }
    if (arrayFlags.includes('AUTOMOD_RULE_CREATE_BADGE')) {
      const automodbot = await loadImage(
        Buffer.from(otherBadges.AUTOMODBOT, 'base64')
      );
      badges.push({ canvas: automodbot, x: 0, y: 15, w: 60 });
    }

    ctx.drawImage(botBagde, textLength + 310, 110);
  } else {
    for (let i = 0; i < flagsUser.length; i++) {
      if (flagsUser[i].startsWith('BOOSTER')) {
        const badge = await loadImage(
          Buffer.from(nitroBadges[flagsUser[i]], 'base64')
        );
        badges.push({ canvas: badge, x: 0, y: 15, w: 60 });
      } else if (flagsUser[i].startsWith('NITRO')) {
        const badge = await loadImage(
          Buffer.from(otherBadges[flagsUser[i]], 'base64')
        );
        badges.push({ canvas: badge, x: 0, y: 15, w: 60 });
      } else {
        const badge = await loadImage(
          Buffer.from(otherBadges[flagsUser[i]], 'base64')
        );
        badges.push({ canvas: badge, x: 0, y: 15, w: 60 });
      }
    }
  }

  if (options?.customBadges?.length) {
    if (options?.overwriteBadges) {
      badges = [];
    }

    for (let i = 0; i < options.customBadges.length; i++) {
      const canvas = await loadImage(parsePng(options.customBadges[i]));
      badges.push({ canvas: canvas, x: 10, y: 22, w: 46 });
    }
  }

>>>>>>> 227cc021d82c518d639503b12a189e59e7f4e72c:src/Code/profileImage.js
  let x = 800;
  badges.forEach(async (badge) => {
    const { canvas, x: bX, y, w } = badge;
    ctx.drawImage(canvas, x + bX, y, w, w);
    x -= 59;
  });

  return canvas;
}

async function genBotVerifBadge(data) {
  const { public_flags_array, username } = data;

  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

  const { textLength } = parseUsername(
    username,
    ctx,
    'Helvetica Bold',
    '80',
    470
  );

  const flagsUser = public_flags_array.sort(
    (a, b) => badgesOrder[b] - badgesOrder[a]
  );
  let botBagde;
  const botVerifBadge =
    otherImgs[flagsUser.includes('VERIFIED_BOT') ? 'botVerif' : 'botNoVerif'];
  botBagde = await loadImage(Buffer.from(botVerifBadge, 'base64'));

  ctx.drawImage(botBagde, textLength + 310, 110);

  return canvas;
}

function genXpBar(options) {
  const {
    currentXp,
    requiredXp,
    level,
    rank,
    barColor,
    levelColor,
    autoColorRank,
    brighterBar,
  } = options.rankData;

  if (isNaN(currentXp) || isNaN(requiredXp) || isNaN(level)) {
    throw new Error(
      'Discord Arts | rankData options requires: currentXp, requiredXp and level properties'
    );
  }

  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');

  const mY = 8;

  ctx.fillStyle = '#000';
  ctx.globalAlpha = alphaValue;
  ctx.beginPath();
  ctx.roundRect(304, 248, 380, 33, [12]);
  ctx.fill();
  ctx.globalAlpha = 1;

  const rankString = !isNaN(rank)
    ? `RANK #${abbreviateNumber(isNumber(rank, 'rankData:rank'))}`
    : '';
  const lvlString = !isNaN(level)
    ? `Lvl ${abbreviateNumber(isNumber(level, 'rankData:level'))}`
    : '';

  ctx.font = '21px Helvetica';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#dadada';
  ctx.fillText(
    `${abbreviateNumber(currentXp)} / ${abbreviateNumber(requiredXp)} XP`,
    314,
    273
  );

  const rankColors = {
    gold: '#F1C40F',
    silver: '#a1a4c9',
    bronze: '#AD8A56',
    current: '#dadada',
  };

  const rankMapping = {
    'RANK #1': rankColors.gold,
    'RANK #2': rankColors.silver,
    'RANK #3': rankColors.bronze,
  };

  if (autoColorRank && rankMapping.hasOwnProperty(rankString)) {
    rankColors.current = rankMapping[rankString];
  }

  ctx.font = 'bold 21px Helvetica';
  ctx.textAlign = 'right';
  ctx.fillStyle = rankColors.current;
  ctx.fillText(
    `${rankString}`,
    674 - ctx.measureText(lvlString).width - 10,
    273
  );

  ctx.font = 'bold 21px Helvetica';
  ctx.textAlign = 'right';
  ctx.fillStyle = levelColor ? parseHex(levelColor) : '#dadada';
  ctx.fillText(`${lvlString}`, 674, 273);

  ctx.globalAlpha = alphaValue;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.roundRect(304, 187 - mY, 557, 36, [14]);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.roundRect(304, 187 - mY, 557, 36, [14]);
  ctx.clip();

  ctx.fillStyle = barColor ? parseHex(barColor) : '#fff';
  ctx.beginPath();
  ctx.roundRect(304, 187 - mY, Math.round((currentXp * 557) / requiredXp), 36, [
    14,
  ]);
  ctx.fill();

  return canvas;
}

function addShadow(canvasToEdit) {
  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext('2d');
  ctx.filter = 'drop-shadow(0px 4px 4px #000)';
  ctx.globalAlpha = alphaValue;
  ctx.drawImage(canvasToEdit, 0, 0);

  return canvas;
}

module.exports = {
  getBadges,
  genBase,
  genFrame,
  genBorder,
  genTextAndAvatar,
  genXpBar,
  genBadges,
  genBotVerifBadge,
  addShadow,
};
