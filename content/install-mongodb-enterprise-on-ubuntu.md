+++
title = "Install MongoDB Enterprise on Ubuntu"

tags = [ "mongodb-enterprise", "administration", "beginner" ]
+++

# Install MongoDB Enterprise on Ubuntu


## Overview

Use this tutorial to install [MongoDB Enterprise](https://www.mongodb.com/products/mongodb-enterprise-advanced?jmp=docs) on LTS Ubuntu Linux systems from
``.deb`` packages.

Platform Support: MongoDB only provides packages for 64-bit LTS (long-term support) Ubuntu releases.
For example, 12.04 LTS (precise), 14.04 LTS (trusty), 16.04 LTS (xenial), and so on.
These packages may work with other Ubuntu releases, however, they are not supported.

Package Updates required on Ubuntu 16.04 for IBM POWER Systems: Due to a lock elision bug present in older versions of the ``glibc``
package on Ubuntu 16.04 for POWER, you must upgrade the ``glibc``
package to at least ``glibc 2.23-0ubuntu5`` before running MongoDB.
Systems with older versions of the ``glibc`` package will experience
database server crashes and misbehavior due to random memory
corruption, and are unsuitable for production deployments of MongoDB

MongoDB provides officially supported Enterprise packages in their own
repository. This repository contains the following packages:

| Package Name | Description |
| - | - | - |
| ``mongodb-enterprise`` | A ``metapackage`` that will automatically installthe four component packages listed below. |
| ``mongodb-enterprise-server`` | Contains the [``mongod``](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) daemon and associatedconfiguration and init scripts. |
| ``mongodb-enterprise-mongos`` | Contains the [``mongos``](https://docs.mongodb.com/manual/reference/program/mongos/#bin.mongos) daemon. |
| ``mongodb-enterprise-shell`` | Contains the [``mongo``](https://docs.mongodb.com/manual/reference/program/mongo/#bin.mongo) shell. |
| ``mongodb-enterprise-tools`` | Contains the following MongoDB tools: [``mongoimport``](https://docs.mongodb.com/manual/reference/program/mongoimport/#bin.mongoimport)[``bsondump``](https://docs.mongodb.com/manual/reference/program/bsondump/#bin.bsondump), [``mongodump``](https://docs.mongodb.com/manual/reference/program/mongodump/#bin.mongodump), [``mongoexport``](https://docs.mongodb.com/manual/reference/program/mongoexport/#bin.mongoexport),[``mongofiles``](https://docs.mongodb.com/manual/reference/program/mongofiles/#bin.mongofiles), [``mongooplog``](https://docs.mongodb.com/manual/reference/program/mongooplog/#bin.mongooplog),[``mongoperf``](https://docs.mongodb.com/manual/reference/program/mongoperf/#bin.mongoperf), [``mongorestore``](https://docs.mongodb.com/manual/reference/program/mongorestore/#bin.mongorestore), [``mongostat``](https://docs.mongodb.com/manual/reference/program/mongostat/#bin.mongostat),and [``mongotop``](https://docs.mongodb.com/manual/reference/program/mongotop/#bin.mongotop). |


## Install MongoDB Enterprise

Note: To install a version of MongoDB prior to 3.2, please refer to that version's documentation. For example, see version [3.0](../install-mongodb-enterprise-on-ubuntu/).

MongoDB only provides packages for 64-bit LTS (long-term support) Ubuntu releases.
For example, 12.04 LTS (precise), 14.04 LTS (trusty), 16.04 LTS (xenial), and so on.
These packages may work with other Ubuntu releases, however, they are not supported.

Use the provided distribution packages as described in this page if possible.
These packages will automatically install all of MongoDB's dependencies, and are
the recommended installation method.


### Step 1: Import the public key used by the package management system.

The Ubuntu package management tools (i.e. ``dpkg`` and ``apt``) ensure
package consistency and authenticity by requiring that distributors
sign packages with GPG keys. Issue the following command to import the
[MongoDB public GPG Key](https://www.mongodb.org/static/pgp/server-3.4.asc):

```sh

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6

```


### Step 2: Create a ``/etc/apt/sources.list.d/mongodb-enterprise.list`` file for MongoDB.

Create the list file using the command appropriate for your version of
Ubuntu:

Ubuntu 12.04

```sh

echo "deb [ arch=amd64 ] http://repo.mongodb.com/apt/ubuntu precise/mongodb-enterprise/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise.list

```

Ubuntu 14.04

```sh

echo "deb [ arch=amd64 ] http://repo.mongodb.com/apt/ubuntu trusty/mongodb-enterprise/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise.list

```

Ubuntu 16.04

```sh

echo "deb [ arch=amd64,arm64,ppc64el,s390x ] http://repo.mongodb.com/apt/ubuntu xenial/mongodb-enterprise/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise.list

```

If you'd like to install MongoDB Enterprise packages from a
particular [release series](https://docs.mongodb.com/manual/release-notes/#release-version-numbers), such as
2.4 or 2.6, you can specify the release series in the repository
configuration. For example, to restrict your system to the 2.6
release series, add the following repository:

```sh

echo "deb http://repo.mongodb.com/apt/ubuntu "$(lsb_release -sc)"/mongodb-enterprise/2.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise-2.6.list

```


### Step 3: Reload local package database.

Issue the following command to reload the local package database:

```sh

sudo apt-get update

```


### Step 4: Install the MongoDB Enterprise packages.


#### Install the latest stable version of MongoDB Enterprise.

Issue the following command:

```sh

sudo apt-get install -y mongodb-enterprise

```

Versions of the MongoDB packages before 2.6 use a different repository
location. Refer to the version of the documentation appropriate for
your MongoDB version.

<span id="install-ubuntu-from-tarball"></span>


## Install MongoDB Enterprise From Tarball

While you should use the ``.deb`` packages as previously
described, you may also manually install MongoDB using the tarballs. See
[Install MongoDB Enterprise From Tarball](../install-mongodb-enterprise-on-linux/) for details.


## Run MongoDB Enterprise

The MongoDB instance stores its data files in ``/var/lib/mongodb``
and its log files in ``/var/log/mongodb`` by default,
and runs using the ``mongodb``
user account. You can specify alternate log and data file
directories in ``/etc/mongod.conf``. See [``systemLog.path``](https://docs.mongodb.com/manual/reference/configuration-options/#systemLog.path)
and [``storage.dbPath``](https://docs.mongodb.com/manual/reference/configuration-options/#storage.dbPath) for additional information.

If you change the user that runs the MongoDB process, you
**must** modify the access control rights to the ``/var/lib/mongodb`` and
``/var/log/mongodb`` directories to give this user access to these
directories.

Most Unix-like operating systems limit the system resources that a
session may use. These limits may negatively impact MongoDB operation.
See [UNIX ulimit Settings](https://docs.mongodb.com/manual/reference/ulimit) for more information.


### Step 1: Start MongoDB.

Issue the following command to start [``mongod``](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod):

```sh

sudo service mongod start

```


### Step 2: Verify that MongoDB has started successfully

Verify that the [``mongod``](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) process has started successfully by
checking the contents of the log file at
``/var/log/mongodb/mongod.log``
for a line reading

```

[initandlisten] waiting for connections on port <port>

```

where ``<port>`` is the port configured in ``/etc/mongod.conf``, ``27017`` by default.


### Step 3: Stop MongoDB.

As needed, you can stop the [``mongod``](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) process by issuing the
following command:

```sh

sudo service mongod stop

```


### Step 4: Restart MongoDB.

Issue the following command to restart [``mongod``](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod):

```sh

sudo service mongod restart

```


### Step 5: Begin using MongoDB.

To help you start using MongoDB, MongoDB provides [Getting
Started Guides](https://docs.mongodb.com/manual/#getting-started) in various driver editions. See
[Getting Started](https://docs.mongodb.com/manual/#getting-started) for the available editions.

Before deploying MongoDB in a production environment, consider the
[Production Notes](https://docs.mongodb.com/manual/administration/production-notes) document.

Later, to stop MongoDB, press ``Control+C`` in the terminal where the
[``mongod``](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) instance is running.


## Uninstall MongoDB

To completely remove MongoDB from a system, you must remove the MongoDB
applications themselves, the configuration files, and any directories containing
data and logs. The following section guides you through the necessary steps.

Warning: This process will *completely* remove MongoDB, its configuration, and *all* databases. This process is not reversible, so ensure that all of your configuration and data is backed up before proceeding.


### Step 1: Stop MongoDB.

Stop the [``mongod``](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) process by issuing the following command:

```sh

sudo service mongod stop

```


### Step 2: Remove Packages.

Remove any MongoDB packages that you had previously installed.

```sh

sudo apt-get purge mongodb-enterprise*

```


### Step 3: Remove Data Directories.

Remove MongoDB databases and log files.

```sh

sudo rm -r /var/log/mongodb
sudo rm -r /var/lib/mongodb

```
