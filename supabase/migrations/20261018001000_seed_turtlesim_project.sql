-- A single editable starter project. IDs are resolved in this database.
begin;
do $seed$
declare
  v_data jsonb := '{"slug":"ros2-turtlesim-first-project","title":"ROS 2 小海龟：第一次消息通信","description":"用键盘控制仿真小海龟，并观察速度话题。无需实体机器人，约 20 分钟走完三个学习阶段。","operatingSystem":"Ubuntu 24.04 LTS（桌面环境）","hardware":["一台可运行 Ubuntu 桌面的电脑","键盘与显示器；无需实体机器人"],"software":["已安装 ROS 2 Jazzy Desktop","turtlesim 软件包"],"prerequisites":["能打开终端并执行命令","已完成 ROS 2 Jazzy 安装；不需要提前学习线性代数"],"duration":"约 20 分钟","difficulty":"beginner","tags":["ROS 2","仿真","入门项目"],"githubUrl":"https://github.com/ros/ros_tutorials","content":"## 你将完成什么\n\n在两个终端中分别运行仿真节点和键盘遥控节点，让小海龟移动；再用第三个终端观察话题，理解发布者与订阅者如何协作。\n\n每个终端都要先加载 ROS 2 环境，遥控时保持键盘焦点在遥控终端。\n\n参考：[ROS 2 Jazzy 官方 turtlesim 教程](https://docs.ros.org/en/jazzy/Tutorials/Beginner-CLI-Tools/Introducing-Turtlesim/Introducing-Turtlesim.html)。这个项目只演示仿真通信，不连接真实电机。","stages":[{"title":"准备并检查环境","description":"确认 ROS 2 环境和 turtlesim 软件包可用。","outcome":"列出 turtlesim 软件包中的可执行程序。","content":"在已安装 ROS 2 Jazzy 的 Ubuntu 中打开终端：\n\n```bash\nsource /opt/ros/jazzy/setup.bash\nsudo apt update\nsudo apt install ros-jazzy-turtlesim\nros2 pkg executables turtlesim\n```\n\n输出中应包含 `turtlesim_node` 和 `turtle_teleop_key`。如果找不到 `ros2`，先检查 ROS 2 安装与环境加载。","links":[{"pattern":"%软件包管理%","kind":"required"},{"pattern":"%环境隔离%","kind":"optional"}]},{"title":"启动仿真并遥控","description":"分别启动仿真节点和键盘遥控节点。","outcome":"用方向键让窗口里的小海龟移动。","content":"终端一启动仿真，并保持运行：\n\n```bash\nsource /opt/ros/jazzy/setup.bash\nros2 run turtlesim turtlesim_node\n```\n\n终端二启动遥控节点：\n\n```bash\nsource /opt/ros/jazzy/setup.bash\nros2 run turtlesim turtle_teleop_key\n```\n\n保持焦点在终端二，按方向键。你应看到仿真窗口中的小海龟改变位置或方向。","links":[{"pattern":"%ROS2框架%","kind":"required"}]},{"title":"观察话题并验收","description":"把运动现象与 ROS 2 话题消息联系起来。","outcome":"找到 /turtle1/cmd_vel，并看到键盘操作产生的速度消息。","content":"保持前两个终端运行，在终端三执行：\n\n```bash\nsource /opt/ros/jazzy/setup.bash\nros2 topic list\nros2 topic info /turtle1/cmd_vel\nros2 topic echo /turtle1/cmd_vel --once\n```\n\n随后回到终端二按方向键，让终端三收到一条消息。验收：能控制小海龟，能找到速度话题，并能说明遥控节点发布消息、仿真节点接收消息。\n\n结束时在运行节点的终端按 `Ctrl+C`。","links":[{"pattern":"%ROS2框架%","kind":"required"},{"pattern":"%系统集成%","kind":"supplement"}]}]}'::jsonb;
  v_project uuid; v_stage uuid; v_owner uuid; v_author text; v_knowledge uuid;
  v_item jsonb; v_link jsonb; v_position bigint; v_link_position integer;
begin
  -- Never overwrite an example that an author has already edited.
  if exists(select 1 from public.projects where slug=v_data->>'slug') then return; end if;
  -- A single-author library owns its starter project. Multi-author installations
  -- receive an unowned editorial example rather than guessing an identity.
  select case when count(distinct author_id)=1 then min(author_id::text)::uuid else null end
    into v_owner from public.knowledge where status='published' and author_id is not null;
  select coalesce(nullif(raw_user_meta_data->>'display_name',''),split_part(email,'@',1))
    into v_author from auth.users where id=v_owner;
  insert into public.projects(owner_id,slug,title,description,author_name,github_url,content,operating_system,
    hardware_requirements,software_requirements,prerequisites,estimated_duration,difficulty)
  values(v_owner,v_data->>'slug',v_data->>'title',v_data->>'description',coalesce(v_author,'Talovryn'),
    v_data->>'githubUrl',v_data->>'content',v_data->>'operatingSystem',
    array(select jsonb_array_elements_text(v_data->'hardware')),
    array(select jsonb_array_elements_text(v_data->'software')),
    array(select jsonb_array_elements_text(v_data->'prerequisites')),v_data->>'duration',v_data->>'difficulty')
  returning id into v_project;
  for v_item,v_position in select value,ordinality from jsonb_array_elements(v_data->'stages') with ordinality loop
    insert into public.project_learning_stages(project_id,position,title,description,outcome,content)
    values(v_project,v_position-1,v_item->>'title',v_item->>'description',v_item->>'outcome',v_item->>'content')
    returning id into v_stage;
    v_link_position := 0;
    for v_link in select value from jsonb_array_elements(v_item->'links') loop
      select id into v_knowledge from public.knowledge where status='published' and title ilike (v_link->>'pattern') order by created_at,id limit 1;
      if v_knowledge is not null then
        insert into public.project_stage_knowledge(stage_id,knowledge_id,kind,position)
        values(v_stage,v_knowledge,v_link->>'kind',v_link_position) on conflict(stage_id,knowledge_id) do nothing;
        v_link_position := v_link_position+1;
      end if;
    end loop;
  end loop;
  insert into public.tags(name) select value from jsonb_array_elements_text(v_data->'tags') on conflict(name) do nothing;
  insert into public.project_tags(project_id,tag_id) select v_project,id from public.tags where name in (select jsonb_array_elements_text(v_data->'tags'));
end;
$seed$;
commit;
