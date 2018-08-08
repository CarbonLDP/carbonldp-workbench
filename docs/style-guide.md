# Workbench's Style guide

This file contains a guide on the existing CSS classes and the styling
of the Workbench.

## Composition of the Workbench Styles

1. **[Semantic UI](https://semantic-ui.com/)** is a front-end development
     which provides a set of CSS classes and modules that make up the
     styles of the Workbench.
2. **Customized classes** named using:
   - **[BEM](http://getbem.com/introduction/) methodology**, is a naming
   convention for CSS classes that personalize the view of a specific
   element or block. In this project, for elements or blocks that don't
   use Semantic UI classes.
   - **Semantic UI naming convention**, is an approach to name classes
   that extend existing Semantic UI classes for specific styles in
   elements that use Semantic UI styles __throughout the Workbench__.

## Naming Conventions

### [BEM](http://getbem.com/introduction/)

The **B**lock **E**lement **M**odifier methodology, or BEM methodology
for short, is a convention for naming CSS classes that helps you make
your classes reusable and modular.
The following is a basic overview, for more information on BEM go to the
[official website](http://getbem.com/introduction/).

**Our conventions**

- **blockName**: standalone entity that is meaningful on its own.
( Basic style for objects in the computer view, for special styles in
mobile/tablet view use a modifier ). e.g. `.mainMenu`, `.sidebar`

- **element**: a part of a block that has no standalone meaning and is
semantically tied to its block. e.g. `.mainMenu-button`, `.sidebar-item`

- **modifier**: the modifier is a flag on a block or element, that
denotes a change in appearance or behavior e.g.
`.mainMenu--mobile`, `.sidebar--dark`,
`.mainMenu-button--small`, `.sidebar-item--dark`

- **blockName-element--modifier**: e.g. `.mainMenu-button--small`,
`.sidebar-item--dark`