const HEADER_REGEX = /bearer token-(.*)$/;

module.exports.authentificate = async ({headers: {authorization}}, {userByEmailLoader}) => {
    const email = authorization && HEADER_REGEX.exec(authorization)[1];
    return email && await userByEmailLoader.load(email);
};
