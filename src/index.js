/* eslint valid-jsdoc: "warn" */
const childProcess = require('child_process');

/**
 * Retrieve a stripped version of terraform's executable version.
 * e.g. (Terraform v0.8.5 => 0.8.5)
 * @todo Use Terraform class API here instead
 * @returns {String} A stripped string representing the version
 */
const version = function showVersion() {
  console.log('not implemented yet');
  return undefined;
};

/**
 * Terraform API Class
 */
class Terraform {
  /**
   * Execute terraform commands
   * @todo Implement `remote`, `debug` and `state` support (which require subcommands)
   * @todo Assert that terraform exists before allowing to perform actions
   * @todo once finalized, document each command
   */
  constructor(params = {}) {
    this.terraformBinary = params.terraformBinary || 'terraform';
    this.workDir = params.workDir || process.cwd();
    this.noColor = params.noColor || false;
    this.debug = params.debug || false;

    if (this.debug) {
      console.log(`init terraform with [${JSON.stringify(params, null, 2)}]`);
      console.log(`workdir : ${this.workDir}`);
      console.log(`terraformBinary : ${this.terraformBinary}`);
      console.log(`noColor : ${this.noColor}`);
      console.log(`debug : ${this.debug}`);
    }
  }

  /**
   * Normalize an option.
   * e.g. Converts `vars_file` to `-vars-file`.
   * @param {String} opt string to normalize
   * @returns {String} A normalized option
   */
  static _normalizeArg(opt) {
    let normalizedOpt = opt.replace('_', '-');
    normalizedOpt = `-${normalizedOpt}`;
    return normalizedOpt;
  }

  /**
  * Construct a string from an object of options
  *
  *  For instance:
  *    {
  *      'state': 'state.tfstate',
  *      'var': {
  *        'foo': 'bar',
  *        'bah': 'boo'
  *      },
  *      'vars_file': [
  *        'x.tfvars',
  *        'y.tfvars'
  *      ]
  *    }
  * will be converted to:
  *   `-state=state.tfstate -var 'foo=bar' -var 'bah=boo' -vars-file=x.tfvars -vars-file=y.tfvars`
  * @param {Object} opts - an object of options
  * @return {String} a string of CLI options
  */
  _constructOptString(opts) {
    // MAP/forEach
    // push+join array instead of string concat
    let optString = '';

    Object.keys(opts).forEach((option) => {
      if (option === 'var') {
        Object.keys(opts[option]).forEach((v) => {
          optString += ` -var '${v}=${opts[option][v]}'`;
        });
      } else if (typeof opts[option] === 'boolean') {
        if (opts[option]) {
          optString += ` -${option}`;
        }
      } else if (Array.isArray(opts[option])) {
        opts[option].forEach((item) => {
          optString += ` ${Terraform._normalizeArg(option)}=${item}`;
        });
      } else {
        optString += ` ${Terraform._normalizeArg(option)}=${opts[option]}`;
      }
    });

    if (this.noColor) {
      optString += ' -no-color';
    }
    return optString;
  }

  /**
  * Execute a terraform subcommand with its arguments and options
  * @todo append subCommandString only if it's not undefined
  * @param {String} subCommandString - a subcommand + options string
  * @return {Object} shelljs exec object
  */
  terraform(subCommandString, callback) {
    let command = this.terraformBinary;
    let hasError = false;
    let alldata = '';

    if (subCommandString) {
      command = `${command} ${subCommandString}`;
    }

    if (this.debug) {
      console.log(`running terraform command [${command}] in [${this.workDir}]`);
    }

    const terraformChild = childProcess.spawn(command, {
      detached: true,
      shell: true,
      cwd: this.workDir,
    });

    terraformChild.stdout.on('data', (data) => {
      if (this.debug) {
        console.log(`terraform stdout = ${data}`);
      }
      alldata += data;
    });

    terraformChild.stderr.on('data', (data) => {
      if (this.debug) {
        console.error(`terraform stderr = ${data}`);
      }

      hasError = true;
      alldata += data;
    });

    terraformChild.on('exit', (code, signal) => {
      if (this.debug) {
        console.log(`terraform process exited with code=${code} signal=${signal}`);
      }
      if (hasError) {
        return callback(new Error(`Error while executing terraform command : [${alldata}]`));
      }
      return callback(null, alldata);
    });
  }

  /**
   * Execute `terraform apply`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dirOrPlan Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  apply(args = {}, autoApprouve = false, cb) {
    let command = `apply${this._constructOptString(args)}`;
    if (autoApprouve) {
      command = `${command}  -auto-approve`;
    }
    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform destroy`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  destroy(args = {}, autoApprouve = false, cb) {
    let command = `destroy${this._constructOptString(args)}`;
    if (autoApprouve) {
      command = `${command}  -auto-approve`;
    }
    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform console`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  console(args = {}, cb) {
    const command = `console${this._constructOptString(args)}`;

    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform fmt`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  fmt(args = {}, cb) {
    const command = `fmt${this._constructOptString(args)}`;

    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform get`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} path      Path to install modules for
   * @return {Object}           shelljs execution outcome
   */
  get(args = {}, cb) {
    const command = `get${this._constructOptString(args)}`;

    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform graph`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  graph(args = {}, cb) {
    const command = `graph${this._constructOptString(args)}`;

    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform import`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} addr      Address to import the resource to
   * @param  {String} id        resource-specific ID to identify that resource being imported
   * @return {Object}           shelljs execution outcome
   */
  import(args = {}, addr, id) {
    return this.terraform(`import${this._constructOptString(args)} ${addr} ${id}`);
  }

  /**
   * Execute `terraform init`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} source    Source to download from
   * @param  {String} path      Path to download to
   * @return {Object}           shelljs execution outcome
   */
  init(args = {}, cb) {
    const command = `init${this._constructOptString(args)}`;
    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform output`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} name      Name of resource to display outputs for (defaults to all)
   * @return {Object}           shelljs execution outcome
   */
  output(args = {}, name, cb) {
    let command = `output${this._constructOptString(args)}`;
    if (name) {
      command = `${command} ${name}`;
    }
    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform plan`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dirOrPlan Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  plan(args = {}, dirOrPlan) {
    let command = `plan${this._constructOptString(args)}`;
    if (dirOrPlan) {
      command = `${command} ${dirOrPlan}`;
    }
    return this.terraform(command);
  }

  /**
   * Execute `terraform push`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  push(args = {}, dir) {
    let command = `push${this._constructOptString(args)}`;
    if (dir) {
      command = `${command} ${dir}`;
    }
    return this.terraform(command);
  }

  /**
   * Execute `terraform refresh`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} dir       Directory in which the plan resides
   * @return {Object}           shelljs execution outcome
   */
  refresh(args = {}, cb) {
    const command = `refresh${this._constructOptString(args)}`;
    return this.terraform(command, cb);
  }

  /**
   * Execute `terraform show`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} path      Path of state file (defaults to local state file)
   * @return {Object}           shelljs execution outcome
   */
  show(args = {}, path) {
    let command = `show${this._constructOptString(args)}`;
    if (path) {
      command = `${command} ${path}`;
    }
    return this.terraform(command);
  }

  /**
   * Execute `terraform taint`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} name      Name of resource to taint
   * @return {Object}           shelljs execution outcome
   */
  taint(args = {}, name) {
    return this.terraform(`taint${this._constructOptString(args)} ${name}`);
  }

  /**
   * Execute `terraform untaint`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} name      Name of resource to untaint
   * @return {Object}           shelljs execution outcome
   */
  untaint(args = {}, name) {
    return this.terraform(`untaint${this._constructOptString(args)} ${name}`);
  }

  /**
   * Execute `terraform validate`
   * @param  {Object} args      option=value pairs for this subcommand
   * @param  {String} path      Path to validate terraform files in (defaults to current)
   * @return {Object}           shelljs execution outcome
   */
  validate(args = {}, path) {
    let command = `validate${this._constructOptString(args)}`;
    if (path) {
      command = `${command} ${path}`;
    }
    return this.terraform(command);
  }
}

module.exports.Terraform = Terraform;
module.exports.version = version;
