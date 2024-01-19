+++
title = "This website"
template = "page.html"
date = 2024-01-19
[taxonomies]
tags = ["webdev"]
[extra]
summary = "How/Why this website came together"
+++

(At the time of writing, I am still a student, hence I am using the present form.)

As my school life slowly draws to a close, one of my teachers decided everyone should probably make themselves a personal portfolio page, so they can present themselves better to potential employers.

As you can tell if you look at my previous webpage, designing websites isn't my strong suit, and as such, I went on a hunt for a static site generator and a nice theme to go along with it.

> ![A screenshot of my old webpage](/images/projects/oldWebsite.png)
> A screenshot of my old webpage

After looking around for a bit, I found [Zola](https://getzola.org), which, to quote their webpage is: "Your one-stop static site engine," which they claimed is easy to use, flexible, and fast. All of which turned out to be true.

Zola, like many similar generators, uses an extended version of Markdown for the pages itself, and templates are written in HTML with markers placed inside for templating.

> ```toml
> +++
> title = "This website"
> template = "page.html"
> date = 2024-01-19
> [taxonomies]
> tags = ["webdev"]
> [extra]
> summary = "How/Why this website came together"
> +++
> ```
>
> The header section of this specific post

> ```html
> <!DOCTYPE html>
> <html lang="en">
>   <head>
>     ...
>   </head>
>   <body>
>     <div class="wrapper">
>       <header>{% include "header.html" %}</header>
>       <main>{% block content %} {% endblock content %}</main>
>       <footer>{% include "footer.html" %}</footer>
>     </div>
>   </body>
> </html>
> ```
>
> An example of a templated HTML file

So now that we have the template engine out of the way, it was time to choose a nice-looking theme that made sure people light up their whole room during the night.

After a few minutes of looking through the [themes](https://getzola.org) on the Zola website, I found the theme that [the website is currently using](https://www.getzola.org/themes/anatole-zola/).

After a small amount of setting stuff up like changing the image and hiding the Avatar in the top right, and there we are! A nice-looking portfolio website that doesn't take ages to make and still has all the capabilities you need.
