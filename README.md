terraformjs
===========

terraformjs is a javascript wrapper for terraform, which aims to provide an simple API to execute terraform commands from a nodejs app.


## Alternatives

There don't appear to be any.


## Installation

```shell
$ npm install [-g] terraformjs
```


## Usage

```javascript

var terraform = require('terraformjs')

console.log(terraform.version())
// 0.8.5

# The constructor receives the following three arguments:
# workDir = process.cwd(), silent = false, noColor = false
let tf = new terraform.Terraform(workDir, silent, noColor);
let outcome = tf.apply()
console.log(outcome.stdout)

// To pass options:
let outcome = tf.apply(
    {
        'state': 'my-state-file.tfstate',
        'var': {'foo': 'bar', 'bah': 'boo'},
        'vars_file': ['x.tfvars', 'y.tfvars']
    }
)

// A commands positional arguments will be passed alongside an object of options:
let outcome = tf.apply({}, process.cwd())

```

## Command positional arguments and options

* Optional positional arguments can be passed as `null` to the function if not required.
* Option names are normalized (e.g. `vars_file` is really `--vars-file`).
* Strings are simple options (e.g. `-state=my-state-file.tfstate`)
* Objects are converted to (multiple) key=values (e.g. `-var 'foo=bar' -var 'bah=boo'`)
* Arrays are converted to multi-usage options (e.g. `--vars-file=x --vars-file=y`)


## Supported subcommands

As of now, the supported subcommands are:

* apply
* destroy
* console
* fmt
* get
* graph
* import
* init
* output
* plan
* push
* refresh
* show
* taint
* untaint
* validate


## Contributions..

See [CONTRIBUTIONS](https://github.com/strigo/terraformjs/blob/master/CONTRIBUTING.md)

Pull requests are always welcome..
