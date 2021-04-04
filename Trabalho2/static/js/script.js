class Wave{
  // a = amplitude
  // w = frequencia
  // k = (vetor) sentido de propagação
  constructor(a, w, k){
    this.a = a;
    this.w = w;
    this.k = k;
  }

  E(x, t) {
    let u = p5.Vector.div(this.k, this.k.mag());
    let k = p5.Vector.div(this.k, this.w);
    let a = this.a*sin(p5.Vector.dot(k, x) + this.w*t);
    let v = p5.Vector.mult(this.u, a);
    let vx = v.x, vy = v.y;
    v.x = -vy; v.y = vx;
    return v;
  }

  propagate(x0=0,y0=0,step=3,c=0){
    this.u = p5.Vector.div(this.k, this.k.mag());
    push();
    translate(x0,y0);
    fill(c);

    let l = 0;
    let d = hypot(height, width);
    let u = createVector(this.u.x, this.u.y).mult(step);
    let v = createVector(0,0);
    let vx = v.x, vy = v.y;
    let w = this.E(vx, frameCount);
    let px = w.x, py = w.y;
    let x,y;

    while (l <= d){
      w = this.E(v, frameCount);
      w.add(v);

      x = w.x; y = w.y;

      line(px,py,x,y);
      px = x; py = y;

      v.add(u);
      l += step;
    }

    pop();
  }
}

class Point {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  move(v){
    this.x += v.x;
    this.y += v.y;
  }

  update(mX,mY){
    return;
  }

  move_to(p){
    this.x = p.x;
    this.y = p.y;
  }
}

class RayTip {
  constructor(ray){
    this.ray = ray;
    this.updateTip();
  }

  updateTip(){
    this.x = this.ray.x + this.ray.arrow_length*this.ray.vec.x;
    this.y = this.ray.y + this.ray.arrow_length*this.ray.vec.y;
  }

  move_to(p){
    this.ray.updateVec(p.x,p.y);
    this.updateTip();
  }
}

class Ray {
  constructor(rays, root_point, arrow_length=30, arrow_size=7, _color_=random_color()) {
    this.color = _color_;
    this.vec = createVector(1,0);
    this.arrow_length = arrow_length;
    this.arrow_size = arrow_size;
    this.x = root_point.x;
    this.y = root_point.y;
    this.open = true;
    this.raytip = new RayTip(this);
    rays.push(this);
  }

  updateVec(mX,mY){
    let dx = (mX - this.x);
    let dy = (mY - this.y);
    if ((dx != 0) && (dy != 0)){
      this.vec.set(dx,dy);
      this.vec.normalize();
    }
  }

  finish(){
    this.open = false;
    this.updateVec(mouseX, mouseY);
    this.raytip.updateTip();
    this.wave = new Wave(2, 0.1, this.vec);
  }

  draw(){
    if(this.open){
      this.open_draw();
    } else {
      this.closed_draw();
    }
    debugable_point(this.x, this.y);
  }

  open_draw(){
    this.updateVec(mouseX, mouseY);
    // Ball + Arrow
    ball_and_arrow2D(this, this.vec, this.arrow_length, this.arrow_size, this.color);
  }

  closed_draw(){
    // Ball + Arrow
    ball_and_arrow2D(this, this.vec, this.arrow_length, this.arrow_size, this.color);
    grabbable_point(this);
    grabbable_point(this.raytip);

    if(debug_mode){
      endless_line(this, this.vec);

    } else{
      this.wave.propagate(this.x, this.y, 10);
    }

  }
  move_to(p){
    this.raytip.x += p.x - this.x;
    this.raytip.y += p.y - this.y;
    this.x = p.x;
    this.y = p.y;
  }
}

class Shape {
  constructor(shapes, root_point, color=random_color()) {
    this.color = color;
    this.points = [root_point];
    this.open = true;
    this.grab_hook = null;
    shapes.push(this);
  }

  get_center(){
    let s = new Point(0,0);
    let i;
    for (i=0; i<this.points.length; i++){
      s.x += this.points[i].x;
      s.y += this.points[i].y;
    }
    s.x /= this.points.length;
    s.y /= this.points.length;
    return s;
  }

  is_inside(p) {
    let c = this.get_center();
    let v = createVector(c.x-p.x, c.y-p.y);
    v.normalize();
    // count how many times v intersects this shape.
    let pseudo_ray = {x:p.x, y:p.y, vec:v};
    let intersections = get_intersections(pseudo_ray, this);
    let n = intersections.length;
    return !!((n>0) && (n%2));
  }

  update(mX,mY){
    return;
  }

  get_grabbed_at(p){
    this.grab_hook = p;
    grabbed = this;
  }

  move_to(p){
    let v = createVector(p.x - this.grab_hook.x, p.y - this.grab_hook.y);
    this.move_points(v);
    this.grab_hook = p;
  }

  move(vec){
    this.move_points(vec);
  }

  move_points(vec){
    let dx = vec.x, dy = vec.y;
    let i;
    for (i=0; i<this.points.length; i++){
      this.points[i].move(vec);
    }
  }

  addPoint(_point_) {
    this.points.push(_point_);
  }

  finish(){
    this.open = false;
  }

  draw(){
    if(this.open){
      this.open_draw();
    } else {
      this.closed_draw();
    }
    let center = this.get_center();
    debugable_point(center.x, center.y);
  }

  open_draw() {
    let i;
    let _point_;
    let mX = mouseX, mY = mouseY;
    push();
    beginShape();
    fill(this.color);
    for (i = 0; i < this.points.length; i++) {
      _point_ = this.points[i];
      vertex(_point_.x, _point_.y);
      debugable_point(_point_.x, _point_.y);
    }
    vertex(mX, mY);
    debugable_point(mX, mY);
    endShape();
    pop();
  }

  closed_draw() {
    let i;
    let _point_;
    beginShape();
    fill(this.color);
    for (i = 0; i < this.points.length; i++) {
      _point_ = this.points[i];
      vertex(_point_.x, _point_.y);
      grabbable_point(_point_);
      debugable_point(_point_.x, _point_.y);
    }
    endShape(CLOSE);
  }
}

// Modes
let debug_mode = false;

let shape_mode = 1;
let ray_mode = 2;
let edit_mode = 3;

let draw_mode = shape_mode;

let drawing_shape = false;
let drawing_ray = false;

let shapes = [];
let rays = [];

// Editing
let grabbable_points = [];
let grabbing_radius = 5;
let grabbed = null;

// Window
let h = 720, w = 1080;
let canvas_diagonal = Math.sqrt(h**2 + w**2);;

// Color Management
function randint(a, b) {
  // random integer in [a, b]
  if (typeof b == 'undefined'){
    b = a;
    a = 0;
  }
  return a + Math.floor((b-a)*Math.random());
}

function random_color(_alpha_=255) {
  let r = randint(0,255);
  let g = randint(0,255);
  let b = randint(0,255);
  return color(r, g, b, _alpha_);
}

function intense_color(_alpha_=255) {
  let r = randint(0,255);
  let g = randint(0,255);
  let b = 255 - ((r+g)/2);
  return color(r, g, b, _alpha_);
}

function last(x){
  return x[x.length-1];
}

function last_shape(shapes){
  return last(shapes);
}

function last_ray(rays){
  return last(rays);
}

function draw_shapes(shapes){
  let i;
  for (i=0; i < shapes.length; i++){
    shapes[i].draw();
  }
}

function draw_rays(rays){
  let i;
  for (i=0; i < rays.length; i++){
    rays[i].draw();
  }
}

function hypot(a, b){
  // Hypotenuse
  return Math.sqrt(a**2 + b**2);
}

function endless_line(p, u, c=0){
  let l = hypot(width, height)
  let v = p5.Vector.mult(u, l);
  push();
  fill(c);
  line(p.x, p.y, p.x + v.x, p.y + v.y);
  pop();
}

function arrow2D(_point_, _vec_, arrow_size, _color_) {
  push();
  stroke(_color_);
  strokeWeight(3);
  fill(_color_);
  translate(_point_.x, _point_.y);
  line(0, 0, _vec_.x, _vec_.y);
  rotate(_vec_.heading());
  translate(_vec_.mag() - arrow_size, 0);
  fill(0);
  triangle(0, arrow_size / 2, 0, -arrow_size / 2, arrow_size, 0);
  pop();
}

function ball_and_arrow2D(_point_, _vec_, arrow_length=15, arrow_size=7, _color_=random_color()) {
  push();
  fill(_color_);
  circle(_point_.x, _point_.y, 5);
  arrow2D(_point_, p5.Vector.mult(_vec_, arrow_length), arrow_size, _color_);
  pop();
}

function mouse_inside(x1=0,y1=0,x2=width,y2=height){
  let mX = mouseX, mY = mouseY;
  return ((x1 <= mX) && (mX <= x2) && (y1 <= mY) && (mY <= y2));
}

function draw_cursor(draw_mode){
  switch(draw_mode){
    case shape_mode:
      cursor(CROSS);
      break;
    case ray_mode:
      cursor(CROSS);
      break;
    case edit_mode:
      if (mouseIsPressed){
        cursor('grabbing');
      } else {
      cursor('grab');
      }
      break;
  }
}

function debugable_point(x,y) {
  if(debug_mode){
    push();
    fill(255,100,100);
    show_coords(x, y);
    pop();
  }
}


// p5.js loops
function setup(){
    // setup window
    createCanvas(w,h);
}

function draw() {
  // Clear screen
  background(255);

  // Cursor
  draw_cursor(draw_mode);

  // Grabbable Points
  grabbable_points = [];

  // Draw objects
  draw_shapes(shapes);
  draw_rays(rays);

  // Intersections
  draw_intersections(rays, shapes);

  // move grabbed objects
  move_grab();
}

// button actions

function _save_(_path_, _mode_='png') {
  // Future: save only the smallest rectangle around the shapes.
  saveCanvas(_path_, _mode_);
}

function set_mode(_mode_) {
  if (_mode_ != draw_mode) {
    cancel_draw(draw_mode);
    draw_mode = _mode_;
  }
}

function toggle_debug_mode(img){
  if(debug_mode){
    debug_mode = false;
    document.getElementById("debug_img").src = "images/debug2.png";
  } else{
    debug_mode = true;
    document.getElementById("debug_img").src = "images/debug.png";
  }
}

// coordinate_strings
function coords(x,y,prec=1){
  return "["+x.toFixed(prec)+ ","+y.toFixed(prec)+"]"
}

function show_coords(x,y,dx=0,dy=0,prec=1){
  text(coords(x,y,prec),x+dx,y+dy);
}


// Cancel drawing

function drawing(){
  return (drawing_shape || drawing_ray);
}

function cancel_draw(target){
  // Cancel the shape drawing
  if (drawing()){
    let figures;
    switch(target){
      case shape_mode:
        drawing_shape = false;
        figures = shapes;
        break;
      case ray_mode:
        drawing_ray = false;
        figures = rays;
        break;
    }
    let _figure_ = figures.pop();
    _figure_ = undefined;
    delete _figure_;
  }
}

function force_finish(target){
  if (drawing()){
    switch(target){
      case shape_mode:
        _shape_ = last_shape(shapes);
        _shape_.finish();
        drawing_shape = false;
        break;
      case ray_mode:
        break;
    }
  }
}

// events

function mouseClicked() {
  if (!mouse_inside()){
    return;
  }
  let _point_;
  switch(draw_mode){
    case shape_mode:
      let _shape_;
      if (drawing_shape){
        // Drawing new shape
        _point_ = new Point(mouseX, mouseY);
        _shape_ = last_shape(shapes);
        _shape_.addPoint(_point_);
      } else {
        // Not Drawing
        _point_ = new Point(mouseX, mouseY);
        _shape_ = new Shape(shapes, _point_, random_color(128));
        drawing_shape = true;
      }
      break;
    case ray_mode:
      let _ray_;
      if (drawing_ray){
        // Drawing new ray
        _ray_ = last_ray(rays);
        _ray_.finish();
        drawing_ray = false;
      } else {
        // Not Drawing
        _point_ = new Point(mouseX, mouseY);
        _ray_ = new Ray(rays, _point_);
        drawing_ray = true;
      }
      break;
    case edit_mode:
      break;
  }
}

function doubleClicked() {
  if (!mouse_inside()){
    return;
  }
  switch(draw_mode){
    case shape_mode:
      if (drawing_shape){
        // end shape
        let _shape_ = last_shape(shapes);
        _shape_.finish();
        _shape_.points.pop();
        drawing_shape = false;
      } else {
        // do nothing
        return;
      }
      break;
    case ray_mode:
      break;
    case edit_mode:
      break;
    default:
      return;
  }
}

function keyPressed() {
  switch(keyCode){
    case ESCAPE:
      // Cancel drawing
      cancel_draw(draw_mode);
      break;

    case ENTER:
      // force finishing the shape drawing
      force_finish(draw_mode);
      break;
  }
}

function mousePressed() {
  grab();
}

function mouseReleased(){
  release_grab();
}

// Grabbing Folks

function grabbable_point(p){
  grabbable_points.push(p);
  if (draw_mode == edit_mode){
    push();
    fill(0);
    ellipse(p.x, p.y, grabbing_radius);
    pop();
  }
}

function grab(){
  if(draw_mode == edit_mode){
    let mX = mouseX, mY = mouseY;
    let i;
    let _point_;
    let s = grabbing_radius, p = null, d;
    for(i=0; i<grabbable_points.length; i++){
      _point_ = grabbable_points[i];
      d = hypot(_point_.x-mX, _point_.y-mY);
      if (d <= s){
        s = d;
        p = _point_;
      }
    }
    // now `p` is the nearest point to the click!
    grabbed = p;

    // or not...
    if (grabbed === null){
      // everbody needs a second chance. (confucius 551-479 b.c.)
      let mp = new Point(mX, mY);
      for (i=0; i<shapes.length; i++){
        if (shapes[i].is_inside(mp)){
          shapes[i].get_grabbed_at(mp);
        }
      }
    }
  }
}

function release_grab(){
  grabbed = null;
}

function move_grab(){
  if (!(grabbed === null)){
    p = new Point(mouseX, mouseY);
    grabbed.move_to(p);
  }
}

// intersections

let symbols_outer = 8;
let symbols_inner = 3;

function draw_entering(p){
  push();
  fill(255);
  ellipse(p.x, p.y, symbols_outer);
  strokeWeight(1.5)
  line(p.x-symbols_inner,p.y-symbols_inner,p.x+symbols_inner,p.y+symbols_inner);
  line(p.x-symbols_inner,p.y+symbols_inner,p.x+symbols_inner,p.y-symbols_inner);
  pop();
}

function draw_exiting(p){
  push();
  fill(255);
  ellipse(p.x, p.y, symbols_outer);
  fill(0);
  ellipse(p.x, p.y, symbols_inner);
  pop();
}

function sort_intersections(its){
  // Bubble Sorting Intersections by distance from source ray.
  let intersections = [];
  let i,j;
  let n = its.length-1;
  let flag = true;
  while ((n > 0)  && flag){
    flag = false;
    for (j=0; j<n; j++){
      if(its[j].d > its[j+1].d){
        let temp = its[j];
        its[j] = its[j+1];
        its[j+1] = temp;
        flag = true;
      }
    }
    n--;
  }
  for(i=0; i<its.length; i++){
    intersections.push(its[i].p);
  }
  return intersections;
}

function get_intersections(ray, shape){
  let intersections = [];
  let s = ray;
  let v = ray.vec;
  let av = v.y/v.x;

  let points = shape.points;
  let p1 = points[0];

  for(k=1; k<=points.length; k++){
    let p2 = points[k%points.length];
    let px = p2.x - p1.x, py = p2.y - p1.y;
    let p = createVector(px, py);

    let ap = py/px;
    let x = (av*s.x - s.y - ap*p1.x + p1.y)/(av - ap);
    let y = av*(x - s.x) + s.y;

    let u = createVector(x-s.x, y-s.y);
    let w = createVector(x-p1.x, y-p1.y);

    let m = p5.Vector.dot(p, w);
    let c = p5.Vector.dot(p, p);

    if(p5.Vector.dot(u, v) > 0){
      if(0<=m && m<=c){
        // intersection found
        intersections.push({p: new Point(x,y), d:u.mag()});
      }
    }
    p1 = p2;
  }
  return sort_intersections(intersections);
}

function all_intersections(rays, shapes){
  // rays, shapes -> object list : [{x: (Int), y: (Int), ray: (Ray), shape: (Shape)}, ... ]
  let intersections = [];
  let i,j,k;
  for(i=0; i<rays.length; i++){
    for(j=0; j<shapes.length; j++){
      intersections.push(get_intersections(rays[i],shapes[j]));
    }
  }
  return intersections;
}

function draw_intersections(rays, shapes){
  let intersections = all_intersections(rays, shapes);
  let i,j;
  for (i=0; i<intersections.length; i++){
    let n = intersections[i].length;
    for (j=0; j<n; j++){
      if(!((n%2) ^ (j%2))){
        // Entering shape
        draw_entering(intersections[i][j]);
      } else{
        // Exiting shape
        draw_exiting(intersections[i][j]);
      }
    }
  }
}
