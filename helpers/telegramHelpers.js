const transformListToMarkDown = (payload) => {
  let list = '';
  payload.map((game) => {
    let temp = list.concat(
      '\n\n' +
        `${game.hasDiscount ? '🏷' : '🔥'} ▸[${game.title}, ${game.price}€ ${
          game.discount ? '//' + game.discount : ''
        }](${game.href})`
    );
    list = temp;
  });

  return `The following game${
    payload.length > 1 ? 's' : ''
  } reached the target price or has discount: ${list}`;
};

module.exports = {
  transformListToMarkDown,
};
