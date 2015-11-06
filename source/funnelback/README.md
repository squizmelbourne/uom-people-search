# Funnelback Configuration

This directory is for version control of Funnelback configuration files and scripts, such as:

* Configuration files
* Freemarker templates
* Pre and/or post command scripts (usually [Groovy](http://www.groovy-lang.org) scripts)

## Synchronisation of Files

The easiest way to keep files synchronised is to use [rsync](http://linux.die.net/man/1/rsync).

Let:

* _GITROOT_ be the location of this repository's root directory on your local drive
* _PUBKEY_ be the local path to your squiz public user key (usually `~/.ssh/somekeyname.pub`)
* _FBSERVER_ be the Funnelback server name

Assumptions:

* For each Funnelback collection you with to synchronise, a directory already exists under `GITROOT/source/funnelback/conf`. For example, if your collections are `example-web` and `example-docs`, you have created the local directories `GITROOT/source/funnelback/conf/example-web` and `GITROOT/source/funnelback/conf/example-docs`.

First, do a dry run to check you are pulling down the correct files:

```bash
cd GITROOT/source/funnelback/conf
coll=`ls`; for c in $coll; do rsync --dry-run -avz -e "ssh -i PUBKEY" squiz@FBSERVER:/opt/funnelback/conf/$c .; done;

```

If the dry run looks OK, sync the files:

```bash
coll=`ls`; for c in $coll; do rsync -avz -e "ssh -i PUBKEY" squiz@FBSERVER:/opt/funnelback/conf/$c .; done;
```
