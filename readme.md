# pear-workshop

Welcome to the [Pear Runtime](https://github.com/holepunchto/pear) Workshop.

https://keet.io

![Pear Workshop](./snap.png)

## Requirements

* `npm` is used to install project dependencies so **Node.js** with `npm` is required
  * For MacOS or Linux - set up node quickly with https://nvm.sh
  * For windows see https://github.com/jasongin/nvs

## Setup

### With Node

Pear is not built on Node. It's just easy to use Node to bootstrap Pear if Node is already installed.

If Node & npm are installed Pear can be bootstrapped on the command-line with:

```sh
npx pear
```

Once installed run `npx pear run pear://runtime`. This will open a new window that shows Complete Pear Setup. Click it. Setup complete. Open a new terminal and run `pear`. Pear help should be output.


Installing any Pear app installs Pear, to install Pear install Desktop Keet from https://keet.io

Then it's just a matter of exposing the `pear` bin in the system PATH. The path to the bin is different per OS.

#### MacOS

Make sure Keet is installed first: https://keet.io

```
echo 'export PATH="$HOME/Library/Application Support/pear/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
pear
```

#### Linux

Make sure Keet is installed first: https://keet.io

```
echo 'export PATH="$HOME/.config/pear/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
pear
```

#### Windows

Make sure Keet is installed first: https://keet.io

##### cmd.exe

```
setx PATH "%USERPROFILE%\AppData\Roaming\Pear\bin;%PATH%"
```

**THEN START A NEW CMD.EXE FOR THE CHANGE TO TAKE EFFECT**

##### Powershell

```
[Environment]::SetEnvironmentVariable(
  "Path",
  "$env:USERPROFILE\AppData\Romaing\pear\bin;$([Environment]::GetEnvironmentVariable('Path','User'))",
  "User"
)
```

**THEN START A NEW POWERSHELL FOR THE CHANGE TO TAKE EFFECT**

## Outline

* Setup
* Pear Preamble - What is Pear?
* [Exercise 01 - Starting](exercises/01-starting/readme.md)
* [Exercise 02 - Making Chat App](exercises/02-making-chat-app/readme.md)
* [Exercise 03 - Building Deployment](exercises/03-building-deployment/readme.md)
* [Exercise 04 - Seeding Deployment](exercises/04-seeding-deployment/readme.md)
* [Exercise 05 - Connecting Peers](exercises/05-connecting-peers/readme.md)
* [Exercise 06 - Updating Deployment](exercises/06-updating-deployment/readme.md)
* Let's Make Snake
* Wrapup

# Pear Runtime Documentation

Pear Runtime Documentation can be found at https://docs.pears.com or pear://runtime/documentation.