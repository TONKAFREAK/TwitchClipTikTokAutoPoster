<h1 align="center"> ⬆️ TikTok Uploader </h1>
<p align="center">A <strong>Selenium</strong>-based automated <strong>TikTok</strong> video uploader</p>

<p align="center">
  <img alt="Forks" src="https://img.shields.io/github/forks/TONKAFREAK/TwitchClipTikTokAutoPoster" />
  <img alt="Stars" src="https://img.shields.io/github/stars/TONKAFREAK/TwitchClipTikTokAutoPoster" />
  <img alt="Watchers" src="https://img.shields.io/github/watchers/TONKAFREAK/TwitchClipTikTokAutoPoster" />
</p>

# Installation

A prequisite to using this program is the installation of a [Selenium-compatible](https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/) web browser. [Google Chrome](https://www.google.com/chrome/) is recommended.

<h2 id="macos-windows-and-linux">MacOS, Windows and Linux</h2>

Install Nodejs v18.16.0 or greater from [python.org](https://nodejs.org/en/download/prebuilt-installer)

<h3 id="building-from-source">Building from source</h3>

Installing from source allows greater flexibility to modify the module's code to extend default behavior.

First, `clone` and move into the repository. Next, install all necessary modules using `npm i` 

```console
git clone https://github.com/TONKAFREAK/TwitchClipTikTokAutoPoster.git
cd TwitchClipTikTokAutoPoster
npm i
```

<h1 id="usage">Usage</h1>

`TwitchClipTikTokAutoPoster` works by duplicating your browser's **cookies** which tricks **TikTok** into believing you are logged in on a remote-controlled browser.

Input your browser's **cookies** into `TwitchClipTikTokAutoPoster/resources/cookie.json` file.

Fill out all the necessary fields in `.env` file.

Run the application using `nodemon` command.

```console
nodemon
```

<h1 id="commands">Commands</h1>

!clip -- to clip last 30 seconds of the twitch stream. 

!post -- clip 30 seconds of the live twitch stream, edit it and post it on tiktok. ( need to manually do the captcha )

!rank -- get the users valorant rank.

<h2 id="chatbot">AI Chatbot</h2>

You can activate the AI chatbot in `.env` file and give desired personality to it.
it randomly answers users in the chat, sends random messages with the chat summary and can be triggered by tagging it or if someone uses the "key word".


<h1 id="future">Future of the project</h1>

I will be making updates and try to make it better. Feel free to fork it and contribute. 
Thank you.
