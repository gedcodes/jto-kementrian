const { privilage, permission_menu, permission, t_menu } = require('../../models');

exports.syncPrivilege = async (id, data) => {
    try {
        await privilage.destroy({
            where: {
                roles_id: id
            },
            logging: false,
        })

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                console.log(key, element);
                if (element) {
                    await privilage.create({
                        permission_menu_id: key, 
                        roles_id: id
                    })
                }
            }
        }
    } catch (error) {
        
    }
}

exports.getPrivilege = async (role_id) => {
    try {
        const q = await privilage.findAll({
            where: {
                roles_id: role_id
            },
            logging: false,
            include: [
                {
                    model: permission_menu,
                    required: true,
                    as: 'privilagepermission',
                    include: [
                        {
                            model: permission,
                            required: true,
                            as: 'permission'
                        },
                        {
                            model: t_menu,
                            required: true,
                            as: 'menu'
                        }
                    ]
                }
            ]
        })

        const menus = {}

        for (const iterator of q) {
            const menu_id = iterator.privilagepermission.menu_id
            const alias   = iterator.privilagepermission.permission.alias
            const menu = iterator.privilagepermission.menu

            if (typeof menus[menu_id] !== 'undefined') {
                menus[menu_id].permission.push(alias)
            } else {
                menus[menu_id] = {
                    id         : menu.id,
                    parent_id  : menu.parent_id,
                    title      : menu.title,
                    path       : menu.path,
                    icon       : menu.icon,
                    group      : menu.group,
                    no_urut    : menu.no_urut,
                    group      : menu.group,
                    alias      : menu.alias,
                    permission :  [
                        alias
                    ]
                }
            }
        }

        return menus
    } catch (error) {
        
    }
}
