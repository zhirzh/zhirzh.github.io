---
layout: post
title: SSH Into Private Machines
date: 2017-01-02
tags: ssh experiment tutorial
---

We can use SSH to access remote machines that are:
1. running an SSH server/daemon
2. **publicly** accessible

But it's also possible to log into a private machine.

Let's look at two cases:

1. public -> private
2. private -> private

<!-- preview -->

---

## Case 0

First off, just to put it in clear, accessing a public machine is as simple as:

```sh
$ ssh remote_username@remote_machine
```

The command above connects us to the remote machine, which is running an SSH server on `port 22`.
If you have the password/key needed, you will gain machine access.

---

## Case 1

To access a private machine's SSH server, we will use *remote port forwarding*.
> Remote Port Forwarding: A port on the remote (server) host is forwarded to a port on local host - [stackexchange answer]

We will connect `port 22` on our machine (the **private** machine) to `port 2222` on the remote machine.
This allows the remote machine to access local's SSH server **as if it were its own!**.

Next, we will issue the standard SSH login command, but with a tiny change - we will SSH to `localhost`.
We do this because the remote machine has access to local's SSH server **as its own**, running on `port 2222`.

So, the username will be `local_username`, but the hostname will be `localhost`.

Remember - local's `port 22` **is** remote's `port 2222`.

```sh
# On our local machine
$ ssh -R 2222:localhost:22 remote_username@remote_machine

# On the remote machine
$ ssh -p 2222 local_username@localhost
```

And *voilà*.

---

## Case 2

With 2 machines, `HOST_A` and `HOST_B`, neither accessible to the other, it is impossible to gain access of one from the other.

But if we have a third, publicly accessible machine - `HOST_Z` - then it's super easy.

```sh
# On HOST_B machine
$ ssh -R 2222:localhost:22 user_z@HOST_Z

# On HOST_A machine, as user_a
$ ssh user_z@HOST_Z

# On HOST_A machine, as user_z
$ ssh -p 2222 user_b@localhost
```

---

## The End

And there you have it.
Now you too can access machines otherwise inaccessible to you.

[stackexchange answer]: http://unix.stackexchange.com/a/118650/73879/
