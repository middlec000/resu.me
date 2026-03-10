{
  description = "Resu.me Environment";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      # self,
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          name = "resu_me_environment";
          buildInputs = [
            pkgs.git
            pkgs.ruff
            pkgs.uv
            pkgs.resumed
          ];
        };
      }
    );
}
