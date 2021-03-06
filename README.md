[![Run Test][gh-run-t-shield]][gh-run-t-url]
[![Package Test][gh-pkg-t-shield]][gh-pkg-t-url]
[![Code Quality][lgtm-shield]][lgtm-url]
[![NPM Downloads][npm-shield]][npm-url]
[![GitHub tag][tag-shield]][tag-url]

[gh-run-t-shield]: https://img.shields.io/github/workflow/status/vrelease/vrelease-js/run-test?label=run%20test&logo=github&style=flat-square
[gh-run-t-url]: https://github.com/vrelease/vrelease-js/actions/workflows/run-test.yml

[gh-pkg-t-shield]: https://img.shields.io/github/workflow/status/vrelease/vrelease-js/pkg-test?label=package%20test&logo=github&style=flat-square
[gh-pkg-t-url]: https://github.com/vrelease/vrelease-js/actions/workflows/pkg-test.yml

[lgtm-shield]: https://img.shields.io/lgtm/grade/javascript/g/vrelease/vrelease-js.svg?logo=lgtm&style=flat-square
[lgtm-url]: https://lgtm.com/projects/g/vrelease/vrelease-js/context:javascript

[npm-shield]: https://img.shields.io/npm/dm/vrelease-bin?logo=node.js&logoColor=fff&style=flat-square
[npm-url]: https://npmjs.com/package/vrelease-bin

[tag-shield]: https://img.shields.io/github/tag/vrelease/vrelease-js.svg?logo=git&logoColor=FFF&style=flat-square
[tag-url]: https://github.com/vrelease/vrelease-js/releases


# `vrelease-js-wrapper`

<img src="icon.svg" height="240px" align="right"/>

Javascript wrapper for [`vrelease`][vrelease]. Install with npm:

```sh
npm install --save-dev vrelease-bin
```

Or yarn:

```sh
yarn add --dev vrelease-bin
```

[vrelease]: https://github.com/vrelease/vrelease


## How can I use it?

For instructions on how to use `vrelease`, [see this](https://github.com/vrelease/vrelease#how-can-i-use-it).

### Global install

```sh
npm i -g vrelease-bin
```

Sudo privileges might be needed. After that, `vrelease` will be available at
`PATH`. Simply:

```sh
vrelease -h
```

### Per project basis

When installing on a single project, add a script to your `package.json`:

```json
{
  "scripts": {
    "vrelease:help": "vrelease -h"
  }
}
```

And run like any npm script:

```sh
npm run vrelease:help
```


## License

To the extent possible under law, [Caian Ertl][me] has waived __all copyright
and related or neighboring rights to this work__. In the spirit of _freedom of
information_, I encourage you to fork, modify, change, share, or do whatever
you like with this project! `^C ^V`

[![License][cc-shield]][cc-url]

[me]: https://github.com/upsetbit
[cc-shield]: https://forthebadge.com/images/badges/cc-0.svg
[cc-url]: http://creativecommons.org/publicdomain/zero/1.0
