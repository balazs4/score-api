[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
# score-api

> unofficial graphql endpoint for http://www.livescore.com page

**GraphiQL Live Demo**: <https://score-api.now.sh>

**Endpoint**: <https://score-api.now.sh/graphql>

![screenhot](./2018_06_05_21_30_1248_319.png)


## How?

it uses the [puppeteer](https://github.com/GoogleChrome/puppeteer)  under the hood for every single [graphql](https://graphql.org/) query.

The resolvers open the livescore page, parse its content and sends back to the client.

## Why?

+ I :heart: :soccer:
+ I wanted to play with `graphql` :metal:
+ It could be _somehow_ 'useful' for the World Cup 2018 :relaxed:

## Can I have my own deployment?

Sure!
[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/balazs4/score-api)

## Author

[@balazs4](https://twitter.com/@balazs4)

## Support on Beerpay
Hey dude, if you like the project you can help me out for a couple of :beers:! Cheers!

[![Beerpay](https://beerpay.io/balazs4/score-api/badge.svg?style=beer-square)](https://beerpay.io/balazs4/score-api)  [![Beerpay](https://beerpay.io/balazs4/score-api/make-wish.svg?style=flat-square)](https://beerpay.io/balazs4/score-api?focus=wish)
