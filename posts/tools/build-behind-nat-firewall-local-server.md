# http 穿透

前段时间和小伙伴讨论微信开发的时候聊到部署测试的问题，这其中必不可少的就是使用工具进行内网穿透。内网穿透的工具大家可能用的最多的要么是花生壳，要么是 NATAPP 可是这些工具都是收费的，那么有没有免费的工具可以用呢？有的，但是如果你是用于开发微信，有两个前提条件，你必须要有自己的域名和自己的 VPS 服务器，满足这两个条件，那么我们就可以自己搭建只属于自己的内网穿透工具了

自己搭建内网穿透的工具好处非常多，其中就是免费，并且因为是自己的服务器和域名，速度可以非常快，而且依赖的开源项目功能非常丰富，可以满足绝大多数下的需求，我使用的内网穿透工具是 github 上的一个项目，名字叫 [frp](https://github.com/fatedier/frp) 它是一个用 Go 语言编写的用于内网穿透的高性能的反向代理应用

项目下载的时候需要根据电脑操作系统来进行选择，支持主流的 MacOS Windows 和各种 Linux 发行版本等，其中 MacOS 系统名称不叫 MacOS 而叫 darwin Mac 用户需要注意一下。这个项目划分服务器端和客户端，用作微信开发使用为目的的话，被微信认证过的服务器也就是自己的 VPS 看作是服务器端，自己本地看作是客户端，分别在两端下载完项目以后，我们来进行配置，其中配置我们划分两端来进行介绍，这里为了安全考虑，会加上访问的 token 和 SSL 的能力，这两个东西的详情请参考文档

## 服务器端配置

在根目录找到 `frps.ini` 编写如下代码

```bash
[common]
bind_port = 7000
# frp 需要监听 80 端口，所以该 80 端口不能被占用，也可以设置其他闲置端口
vhost_http_port = 80

# token
authenticate_heartbeats = true
authenticate_new_work_conns = true
authentication_method = token
token = dVo3rtiakUFsvictWi43xx4q
``` 

## 客户端配置

同样，在根目录找到 `frpc.ini` 编写如下代码

```bash
# frpc.ini
[common]
# 你自己的服务器 IP 地址
server_addr = xxx.xxx.xxx.xxx 
# 对应你服务器端设置里的 bind_port 的值
server_port = 7000

authenticate_heartbeats = true
authenticate_new_work_conns = true
authentication_method = token
token = dVo3rtiakUFsvictWi43xx4q

[web]
type = http
# 本地穿透项目的端口号
local_port = 8000
# 穿透使用的域名，要保证域名解析正确
custom_domains = www.xxx.xxx
```

# https 穿透

## 服务器端配置

在根目录找到 `frps.ini` 编写如下代码

```bash
[common]
bind_port = 7000
vhost_https_port = 443

authenticate_heartbeats = true
authenticate_new_work_conns = true
authentication_method = token
token = dVo3rtiakUFsvictWi43xx4q
``` 

## 客户端配置

同样，在根目录找到 `frpc.ini` 编写如下代码

```bash
# frpc.ini
[common]
# 你级的服务器 IP 地址
server_addr = xxx.xxx.xxx.xxx
# 对应你服务器端设置里的 bind_port 的值
server_port = 7000

# token
authenticate_heartbeats = true
authenticate_new_work_conns = true
authentication_method = token
token = dVo3rtiakUFsvictWi43xx4q

[test_htts2http]
type = https
# https 转本地的 http 这里的域名对应你自己的域名，这个域名要成功解析到你的服务器并且保证可用
custom_domains = www.x.x

plugin = https2http
# 端口号为你本地项目的端口号
plugin_local_addr = 127.0.0.1:5000

# HTTPS 证书相关的配置

# 地址对应你的 .crt 文件所在的路径
plugin_crt_path = ./server.crt
# 地址对应你的 .key 文件所在的路径
plugin_key_path = ./server.key
plugin_host_header_rewrite = 127.0.0.1
plugin_header_X-From-Where = frp
```

为了保证一定的安全，这里设置了 `frp` 的 `token` 要保证服务端和客户端的 `token` 值一致

# 启动和系统服务

启动方式为在服务器端和客户端各自的根目录下，分别执行 `./frps -c ./frps.ini` 和 `./frpc -c ./frpc.ini` 就可以了。需要注意的是，一定要保证两端都保持运行才能进行使用。现在还有一个问题是，一般我们自己的服务器不管是 VNC 的方式连接还是远程 SSH 如果限制时间过长就会断开连接，这个时候其实我们希望让 frp 变成系统服务，以守护进程的方式运行，所以这里提供一个 `install.sh` 简单脚本可以做到 

```
#!/bin/bash

sudo mkdir -p /etc/frp
sudo mv ./* /etc/frp
sudo chown -R ubuntu:ubuntu /etc/frp
sudo chmod 0700 /etc/frp
sudo setcap cap_net_bind_service=+eip /etc/frp/frps

sudo ln -sf /etc/frp/systemd/frps.service /lib/systemd/system
sudo ln -sf /etc/frp/frps /usr/bin/frps
sudo systemctl daemon-reload
sudo systemctl enable frps
sudo systemctl start frps
```

其中设置 `sudo chown -R ubuntu:ubuntu /etc/frp` 需要根据自己的用户情况进行设置

值得一提的是，不知道哪个版本之后原本提供的 `systemd` 不提供了，需要自己创建，这里也给出创建模版，以配合 `install.sh` 脚本中系统服务的设置，在根目录下创建 `systemd` 文件夹，创建 `frps.service` 和 `frps@.service` 两个文件，内容分别如下

```
[Unit]
Description=Frp Server Service
After=network.target

[Service]
Type=simple
User=lighthouse
Restart=on-failure
RestartSec=5s
ExecStart=/usr/bin/frps -c /etc/frp/frps.ini

[Install]
WantedBy=multi-user.target
```

```
[Unit]
Description=Frp Server Service
After=network.target

[Service]
Type=simple
User=lighthouse
Restart=on-failure
RestartSec=5s
ExecStart=/usr/bin/frps -c /etc/frp/%i.ini

[Install]
WantedBy=multi-user.target
```

下载完 frp 以后在根目录配置好 `frps.ini` 或者 `frpc.ini` 然后执行 `./install.sh` 就可以了。这时候，就已经为系统添加了一个名为 frp 的系统服务，可以执行，重启，查看状态，当做一般系统服务进行使用。需要注意的是，需要服务端和客户端的一些信息要保证一致，比如 `token`，例子中的 `7000` 端口不能被占用

frp 的功能很多，以上配置例如 token 和 SSL 不是必须的，可以根据自己需要进行修改。最后，使用它，我们就有了一个属于自己的内网穿透工具了
