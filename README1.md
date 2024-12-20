ToDO:
[!] : change DB scheme drawio- add IsFixed, Language
[+] : fix 1 to 8 charachters with password in registrathion and update password
[+] : add to DB user language
[+] : build update avatar in settings
[!] : добавить проверку на тип канала лс или груповой чат при добавлении и удалении пользователя(без этого проверка отбрасывает ограничение по роли, пойдет но не идеально)
[!] : auto refresh tokens
Upgrade:
[?] : add public chanels
[+] : add avatars to group chat

chat roles:
owner: 1 // владелец
deleteAllMember 2 // администратор
addMember, upload avatar, upload chatName : 3 // участник+
send message : 4 // участник
only read chat : 5 // читатель

[] : На диплом
[!]: при загрузке аватара старый не удаляется если у него было другое расширение, нужно исправить.
[!]: добавить загрузку файлов в чаты
[!]: добавить пагинацию к получаемым сообщениям и подгружать только при скрролле.