# Post-build configuration

Since the workbench requires certain parameters to be configured for it to run
(e.g. Carbon LDP instance configuration parameters), the Docker image is configured
to run a script before starting the nginx server: 

[../scripts/write-global-variables.sh](../scripts/write-global-variables.sh).

This script reads the environment variables passed when launching the Docker container
and replaces their values on the `dist/app/index.html` file. That way, the application
can be configured after building the source code (meaning reduced starting times).
