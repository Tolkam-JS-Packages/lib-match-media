# tolkam/lib-match-media

Media query events listener.

## Usage

````ts
import MM from '@tolkam/lib-match-media';

const rules = {
    small: '(max-width:575px)',
    med: '(min-width:576px) and (max-width:767px)',
    landscape: 'all and (orientation: landscape)',
};

const mm = new MM(rules);

mm.listen((matches) => {
    console.log('matches %O', matches);
});
````

## Documentation

The code is rather self-explanatory and API is intended to be as simple as possible. Please, read the sources/Docblock if you have any questions. See [Usage](#usage) for quick start.

## License

Proprietary / Unlicensed 🤷
