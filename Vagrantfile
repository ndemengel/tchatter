Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "infra/vagrant-box.yml"
    ansible.sudo = true
  end
end
