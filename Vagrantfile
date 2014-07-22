Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "infra/vagrant-box.yml"
    ansible.sudo = true
  end

  config.vm.network "forwarded_port", guest: 6379, host: 6379
end
