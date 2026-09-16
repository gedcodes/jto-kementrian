const { t_menu, permission_menu, permission } = require('../models');

const MenuController = () => {
    const findAlls = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const docs = await t_menu.findAll({
                include: [
                    {
                        model: permission_menu,
                        as: 'menupermission',
                        include: [
                            {
                                model: permission,
                                required: true,
                                as: 'permission',
                                order: [
                                    ['id']
                                ]
                            }
                        ]
                    }
                ],
                order: [
                    ['no_urut']
                ],
                logging: false
            })

            res.status(200).json({
                success: true,
                message: "Req. Success",
                data: docs
            });

        } catch (error) {
            next(error)
        }
    }

    return {
        findAlls
    }
}
module.exports = MenuController;