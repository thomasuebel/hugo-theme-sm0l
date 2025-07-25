# Hugo "Sm0l" Theme

A small theme for HUGO static site generator, 
focused on semantic HTML and accessibility and readability.

# Using Sm0l

inside your HUGO project folder

```
git submodule add https://github.com/thomasuebel/hugo-theme-sm0l.git themes/sm0l
```

add 

```
theme = 'sm0l'
```

Built with help from [Eric Murphy's HUGO Starter Theme](https://github.com/ericmurphyxyz/hugo-starter-theme). 
To learn more about building themes in Hugo, refer to Hugo's [templating documentation](https://gohugo.io/templates/).

# IndieWeb

The theme is built around the idea that the IndieWeb needs all the support it can get. The
Author information that you put in your configuration is rendered as an IndieWeb h-card.
Into your sites index file.

# Base Config
```
baseURL = 'https://yourwebsite.com/'
title = "Your title here"
theme = 'sm0l'
enableRobotsTXT = true
``` 

# Author Information
```
[params.author]
name = "your name"
avatar = "/images/avatar.png"
```

# Avatar

Place your avatar image PNG into your assets/images/ directory as avatar.png. It will override the
themes avatar image. 