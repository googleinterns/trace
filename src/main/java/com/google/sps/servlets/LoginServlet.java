package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* Allow users to log in and out of our site using their @google accounts*/
@WebServlet("/login")
public class LoginServlet extends HttpServlet {

  /* Determines whether or not a user is logged in and responds accordingly. */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html");

    UserService userService = UserServiceFactory.getUserService();
    if (userService.isUserLoggedIn()) {
    // Check if user is already logged in. If so, let them log out.
      String userEmail = userService.getCurrentUser().getEmail();
      String urlToRedirectToAfterUserLogsOut = "/index.html";
      String logoutUrl = userService.createLogoutURL(urlToRedirectToAfterUserLogsOut);

      // Prints the user email followed by a dot. The dot is then used by a split function 
      // within login() in index-script.js to see if a user email is displayed or not. 
      response.getWriter().println("<p>" + userEmail + ".</p>");
      // Prints the logout url 
      response.getWriter().println("<p>Logout <a href=\"" + logoutUrl + "\">here</a>.</p>");
    } else {
      // Otherwise, allow them to log in. 
      String urlToRedirectToAfterUserLogsIn = "/index.html";
      String loginUrl = userService.createLoginURL(urlToRedirectToAfterUserLogsIn);

      // Prints a single dot to be used in index-script.js login() split function
      // to determine if a user is logged in.
      response.getWriter().println(".");
      // Prints the login url
      response.getWriter().println("<p>Login <a href=\"" + loginUrl + "\">here</a>.</p>");
    }
  }
}