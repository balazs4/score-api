const extract = match => {
  const rows = [
    ...document.querySelector('div[data-type=content]').querySelectorAll('.row')
  ];

  return rows.reduce(
    (acc, obj) => {
      if (obj.attributes['data-type'].value.includes('header')) {
        acc.header = obj.innerText.replace(/\s/g, '').split(':')[0];
        acc.values[acc.header] = [];
        return acc;
      }
      if (obj.attributes['data-type'].value === 'incident') {
        const team = [match.home, match.away];
        const event =
          obj
            .querySelector('.sco')
            .innerText.trim()
            .split('-')
            .map(x => x.trim())
            .join('-') ||
          Array.from(
            new Set(
              []
                .concat(
                  ...[
                    ...obj.querySelector('.sco').querySelectorAll('.inc')
                  ].map(y => y.attributes['class'].value.split(' '))
                )
                .filter(
                  y =>
                    y !== 'empty' &&
                    y !== 'inc' &&
                    y !== 'goal' &&
                    y !== 'inc-awy' &&
                    y !== 'inc-hom'
                )
            )
          ).join(', ');
        const value = {
          min: obj.querySelector('.min').innerText.trim(),
          event,
          player: [...obj.querySelectorAll('.ply')]
            .map(
              (y, i) =>
                y.innerText.trim() ? `${y.innerText.trim()} (${team[i]})` : null
            )
            .filter(y => y)
            .join(', ')
        };

        acc.values[acc.header].push(value);
        return acc;
      }
      acc.values[acc.header] = [...obj.children]
        .map(x => x.innerText.trim())
        .join(', ');
      return acc;
    },
    { values: {}, header: null }
  );
};

module.exports = browser => async match => {
  if (match.href === null) return match;
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    const type = request.resourceType();
    if (['images', 'font', 'stylesheet'].some(x => x === type)) request.abort();
    else request.continue();
  });
  await page.goto(match.href, { waitUntil: 'networkidle2' });
  const { values } = await page.evaluate(extract, match);
  return Object.assign({}, match, values);
};
