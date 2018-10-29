# Conventions

In this file we list all the conventions followed to name files and variables,
and how to apply styles used by in Workbench's components.

## General conventions

Most of the rules written in here that are followed throughout the Workbench
are based on the [Style guide](https://angular.io/guide/styleguide#file-structure-conventions)
published by the Angular team.

The following are the main rules of this convention.

- ### Files structure convention

    When creating a component or coding a new feature (component, service,
    pipe, etc) try to group all the files that make up that functionality by
    in the same directory. For example, when coding a new feature to handle
    users that implies the creation of a new component, a new pipe and a
    new service, try to group all those files int he same folder called users
    instead of separating all the services in a folder called services, or
    your user related pipes in a folder called pipes, etc.

    *Do*: ✅

         ./src/app/
         └── users/
             ├── users.component.html
             ├── users.component.scss
             ├── users.component.ts
             ├── users.pipe.ts
             └── users.service.ts

    *Don't*: ❌

         ./src/app/
         ├── services/
         │   └── users.service.ts
         ├── pipes/
         │   └── users.pipe.ts
         └── components/
             ├── users.component.html
             ├── users.component.scss
             └── users.component.ts


- ### Separate file names with dots and dashes

    When naming classes use camel concatenating their name with their types
    like this (`UsersComponent`, `UsersService`)

    *Do*: ✅

    ```typescript
    // users.service.ts
    //...
    @Injectable()
    export class UsersService { }
    ```

    ```typescript
    // users-list.component.ts
    //...
    @Component({ ... })
    export class UsersListComponent { }
    ```

   ```typescript
   // users.module.ts
   //...
   @NgModule({ ... })
   export class UsersModule { }
   ```

    *Don't*: ❌

    ```typescript
    // users.service.ts
    //...
    @Injectable()
    export class Users_Service { }
    ```

    ```typescript
    // users-list.component.ts
    //...
    @Component({ ... })
    export class Users_List_Component { }
    ```

   ```typescript
   // users.module.ts
   //...
   @NgModule({ ... })
   export class Users { } // Missing type
   ```


- ### Component selectors

    When defining the selectors for a component **_use lowercase_**,
    use **_hyphens_** and **_add a prefix_***[]:

    The prefix used by all the components is the prefix `cw` which stands
    for **C**arbonLDP **W**orkbench.

    *Do*: ✅

    ```typescript
    // users.directive.ts
    //...
    @Pipe({
        selector: "cwValidate"
    })
    export class ValidateDirective { }
    ```

    ```typescript
    // users-list.component.ts
    //...
    @Component({
        selector: "cw-users-list"
    })
    export class UsersListComponent { }
    ```

    *Don't*: ❌

    ```typescript
    // users.directive.ts
    //...
    @Pipe({
        selector: "cw_Validate"
    })
    export class ValidateDirective { }
    ```

    ```typescript
    // users-list.component.ts
    //...
    @Component({
        selector: "users-list"  // Missing prefix
    })
    export class UsersListComponent { }
    ```


- ### Routing files

    When naming Routes files use dots to separate the file type from its name


    *Do*: ✅

    ```typescript
    // users.routing.ts
    ```

     *Don't*: ❌

    ```typescript
    // usersRouting.ts
    ```


- ### Components as pages

    If you have an angular component that acts as a _"landing page"_ for
    something, then use `view` instead of `component` as its type while
    naming its file. For example, let's say that a component called security
    will be the landing page when visiting the following route:
    `http://lolcahost/security/`


    *Do*: ✅

    ```typescript
    // security.view.ts  <-- The type of the file is view
    //...
    @Component({
        selector: "cw-security"
        template: `<cw-users></cw-users>`
    })
    export class SecurityView { }   //  <-- The classname has View
    ```

     *Don't*: ❌

    ```typescript
    // security.component.ts  <-- The type of the file is component
    //...
    @Component({
        selector: "cw-security"
        template: `<cw-users></cw-users>`
    })
    export class SecurityComponent { }  //  <-- The classname has Component
    ```

For more coding conventions, please read and follow the general Angular
style guide:

https://angular.io/guide/styleguide

